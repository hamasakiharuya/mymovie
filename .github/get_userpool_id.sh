#!/bin/bash
#対象ファイル一覧を取得
TARGET_FILE_LIST=(`grep -rl "user_pool_id" ./js/`)

#USER POOL存在確認
aws cognito-idp list-user-pools --max-results 1 --region ap-northeast-1 > /dev/null 2>&1 
USER_POOL_CHRCK=$?
#現在のID
if [ ${USER_POOL_CHRCK} -eq 0 ]; then
  USER_POOL_ID=`aws cognito-idp list-user-pools --max-results 1 --region ap-northeast-1 | grep "Id" | cut -d ":" -f2 | tr -d \" | tr -d , | tr -d ' '`
  if [[ "${USER_POOL_ID}" == ap-northeast-1* ]]; then
    CLIENT_ID=`aws cognito-idp list-user-pool-clients --user-pool-id ${USER_POOL_ID} --region ap-northeast-1 | grep "ClientId" | cut -d ":" -f2 | tr -d ' ' | tr -d \" | tr -d \,`
  else
    echo "ERROR: USER_POOL_ID not expected ${USER_POOL_ID}"
    exit 1
  fi
else
  echo "ERROR: USER_POOL does not exist"
  exit 1
fi


for i in ${TARGET_FILE_LIST[@]}
do
  sed -ir 's/'{USER_POOL_ID}'/'${USER_POOL_ID}'/' $i
  sed -ir 's/'{CLIENT_ID}'/'${CLIENT_ID}'/' $i
  USER_POOL=`grep "user_pool_id" $i | tr -d ' '`
  CLIENT=`grep "client_id" $i | tr -d ' '`
  echo "---$i---
  change completed : ${USER_POOL}
  change completed : ${CLIENT}"
done