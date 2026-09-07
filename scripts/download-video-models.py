"""Pinned, minimal LTX-2.3 distilled inference components for CJC-365."""
import os, json, time, hashlib
from pathlib import Path
ROOT=Path(os.environ.get('CJ_VIDEO_HOME', str(Path.home()/'LocalAI/cjc-365')))
(ROOT/'renders').mkdir(parents=True, exist_ok=True)
os.environ['HF_HOME']=str(ROOT/'cache/huggingface')
os.environ['HF_HUB_DISABLE_IMPLICIT_TOKEN']='1'
os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
from huggingface_hub import snapshot_download, HfApi
models=[
 ('dgrauet/ltx-2.3-mlx-q8','6671a7572a530862d1d60ce393b5d93491e3f76b','ltx-2.3-q8',[
 'README.md','LICENSE','*.json','audio_vae.safetensors','connector.safetensors','transformer-distilled.safetensors',
 'spatial_upscaler_x2_v1_1.safetensors','vae_decoder.safetensors','vae_encoder.safetensors','vocoder.safetensors']),
 ('mlx-community/gemma-3-12b-it-4bit','86cc6a8dedbc456dd0e4af01a9d09f396f77e558','gemma-3-12b-4bit',None)
]
receipts=[]
for repo,revision,folder,patterns in models:
 start=time.monotonic()
 print('Downloading',repo,revision,flush=True)
 snapshot_download(repo_id=repo,revision=revision,local_dir=ROOT/'models'/folder,allow_patterns=patterns,token=False,max_workers=4)
 info=HfApi(token=False).model_info(repo,revision=revision,files_metadata=True)
 files=[{'path':f.rfilename,'bytes':f.size,'sha256':f.lfs.sha256 if f.lfs else None} for f in info.siblings if (ROOT/'models'/folder/f.rfilename).is_file()]
 receipt={'repo':repo,'revision':revision,'path':str(ROOT/'models'/folder),'download_seconds':round(time.monotonic()-start,2),'files':files,'downloaded_bytes':sum(f['bytes'] or 0 for f in files)}
 for file in files:
  path=ROOT/'models'/folder/file['path']
  assert path.stat().st_size==file['bytes'], path
  if file['sha256']:
   with path.open('rb') as handle:
    assert hashlib.file_digest(handle,'sha256').hexdigest()==file['sha256'], path
   file['sha256_verified']=True
 receipts.append(receipt)
 (ROOT/'models'/'download-receipt.json').write_text(json.dumps(receipts,indent=2)+'\n')
 print('Verified file manifest',repo,receipt['downloaded_bytes'],flush=True)
