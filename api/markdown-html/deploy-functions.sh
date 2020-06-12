#!/bin/bash
gcloud functions deploy markdownHtml \
  --trigger-http  \
  --runtime=nodejs10 \
  --source=.\
  --region=asia-northeast1 \
  --memory=256\
  --timeout=90\
  --allow-unauthenticated
