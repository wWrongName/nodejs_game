function request {
    cmd=`npm list | grep $1`
    if [[ $cmd != *$1* ]]
    then
        return 1
    else
        return 0
    fi
}
#counter for catching errors
ctr=0
#check every module and collect returns
request mocha@
ctr=$(($ctr + $?))
request fs.realpath@
ctr=$(($ctr + $?))
request ws@
ctr=$(($ctr + $?))
request axios@
ctr=$(($ctr + $?))
request swagger-ui-express@
ctr=$(($ctr + $?))
request swagger-jsdoc@
ctr=$(($ctr + $?))
#check error before tests
if [ $ctr -ne 0 ]
then
    return 1
fi
#run unit-tests
source unit-test.bash
ctr=$(($ctr + $?))
#if ctr == 0 then all modules exist
if [ $ctr -ne 0 ]
then
    return 1
else
    return 0
fi
