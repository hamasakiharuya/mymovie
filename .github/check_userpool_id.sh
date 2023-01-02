#!/bin/bash
#対象ファイル一覧を取得
TARGET_FILE_LIST=(`grep -rl "user_pool_id" ./js/`)

#USER POOL存在確認
aws cognito-idp list-user-pools --max-results 1 --region ap-northeast-1 > /dev/null 2>&1 
USER_POOL_CHRCK=$?
#現在のID
if [ ${USER_POOL_CHRCK} -eq 0 ]; then
  USER_POOL_ID=`aws cognito-idp list-user-pools --max-results 1 --region ap-northeast-1 | grep "Id" | cut -d ":" -f2 | tr -d \" | tr -d , | tr -d ' '`
  CLIENT_ID=`aws cognito-idp list-user-pool-clients --user-pool-id ${USER_POOL_ID} --region ap-northeast-1 | grep "ClientId" | cut -d ":" -f2 | tr -d ' ' | tr -d \" | tr -d \,`
else
  echo "ERROR: USER_POOL does not exist"
  exit 1
fi

for i in ${TARGET_FILE_LIST[@]}
do
  #既存ファイルのUserPoolId
  FILE_USER_POOL_ID=`grep "user_pool_id" $i | head -n 1 | cut -d "=" -f2 | tr -d ' ' | tr -d \"`
  FILE_CLIENT_ID=`grep "client_id" $i | head -n 1 | cut -d "=" -f2 | tr -d ' ' | tr -d \"`
  
  echo "-----------$i--------------"
  echo ${USER_POOL_ID}
  echo ${FILE_USER_POOL_ID}
  echo ${CLIENT_ID}
  echo ${FILE_CLIENT_ID}
  #ID置き換え
  if [ ${USER_POOL_ID} != ${FILE_USER_POOL_ID} ]; then
    sed -i 's/'${FILE_USER_POOL_ID}'/'${USER_POOL_ID}'/' $i
  fi

  if [ ${CLIENT_ID} != ${FILE_CLIENT_ID} ]; then
    sed -i 's/'${FILE_CLIENT_ID}'/'${CLIENT_ID}'/' $i
  fi
done