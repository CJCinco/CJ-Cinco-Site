"""Run a named, reproducible LTX render with wall-clock and memory evidence."""
import os,sys,json,time,resource,subprocess,platform
from pathlib import Path
ROOT=Path(os.environ.get('CJ_VIDEO_HOME', str(Path.home()/'LocalAI/cjc-365')))
(ROOT/'renders').mkdir(parents=True, exist_ok=True)
os.environ['HF_HOME']=str(ROOT/'cache/huggingface')
os.environ['HF_HUB_OFFLINE']='1'
os.environ['HF_HUB_DISABLE_IMPLICIT_TOKEN']='1'
os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
name=sys.argv[1]
settings=json.loads(Path(__file__).with_name('hero-render-settings.json').read_text())[name]
output=ROOT/'renders'/f'{name}.mp4'
if output.exists():
 raise SystemExit(f'Refusing to overwrite existing render: {output}')
import mlx.core as mx
from ltx_pipelines_mlx.cli import main
mx.set_memory_limit(90*1024**3)
args=['ltx-2-mlx','generate','--model',str(ROOT/'models/ltx-2.3-q8'),'--gemma',str(ROOT/'models/gemma-3-12b-4bit'),'--distilled','-p',settings['prompt'],'-o',str(output),'-H',str(settings['height']),'-W',str(settings['width']),'-f',str(settings['frames']),'--frame-rate','24','-s',str(settings['seed'])]
sys.argv=args
started=time.time(); status='failed'; error=None
try:
 main()
 status='rendered'
except BaseException as exc:
 error=repr(exc)
 raise
finally:
 receipt={'issue':'CJC-365','name':name,'type':status,'observed_at_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'wall_seconds':round(time.time()-started,3),'peak_rss_bytes':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,'peak_mlx_bytes':mx.get_peak_memory(),'memory_limit_bytes':90*1024**3,'settings':settings,'argv':args,'output':str(output),'error':error,'runner_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT/'ltx-2-mlx',text=True).strip(),'python':platform.python_version(),'mlx':mx.__version__}
 (ROOT/'renders'/f'{name}.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print(json.dumps(receipt),flush=True)
