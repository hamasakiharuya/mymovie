#!/bin/bash
#対象ファイル一覧を取得
TARGET_FILE_LIST=(`grep -rl "{DOMAIN}" ./`)

#CloudFront存在確認
aws cloudfront list-distributions --max-items 1 --output table > /dev/null 2>&1 
USER_POOL_CHRCK=$?

if [ ${USER_POOL_CHRCK} -eq 0 ]; then
  CLOUDFRONT_CNAME=`aws cloudfront list-distributions --max-items 1 --output table | grep "CNAME" | cut -d "|" -f6 | tr -d ' '`
  echo ${CLOUDFRONT_CNAME}
else
  echo "ERROR: CloudFront does not exist"
  exit 1
fi

#Domain入力
if [[ "${CLOUDFRONT_CNAME}" == *mymovie.jp ]]; then
  for i in ${TARGET_FILE_LIST[@]}
  do
    sed -i 's/'¥{DOMAIN¥}'/'${CLOUDFRONT_CNAME}'/' $i
    grep -rl '${CLOUDFRONT_CNAME}' $i
  done
fi