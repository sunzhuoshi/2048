#!/bin/sh
source config.sh

if [ ! $upload_server ]; then
    echo 'upload_server not assigned'
    exit 1
fi
if [ ! $upload_user ]; then
    echo 'upload_user not assigned'
    exit 1
fi
if [ ! $upload_dir ]; then
    echo 'upload_dir not assigned'
    exit 1
fi

project=pad2048
distr_files=(cache.manifest favicon.ico index.html LICENSE.txt)
rm_files=()
# DO NOT ADD the last '/'
distr_dirs=(img js meta style)
root_dir=$(pwd)
archive_dir=$(pwd)/archive
usage() 
{
	echo "Usage: $0 version"
	exit 1
}
check_error() 
{
	result=$?
	if [ $result -ne 0 ]; then
		echo error occurred, exit: $result
		exit $result
	fi
}
create_dir() 
{
	echo create_dir $1
	if [ ! -d $1 ]; then
		mkdir $1
		check_error;
	fi
}
if [ $# -lt 1 ]; then
	usage
fi
version=$1

version_dir=$archive_dir/v$version
tar_file_name=$project-v$version.tar.gz
tar_file=$archive_dir/$tar_file_name
create_version_dir()
{
        create_dir $archive_dir
        create_dir $version_dir
}
echo 'start'
create_version_dir

for file in ${distr_files[@]}; do
	cp -fv $file $version_dir/ 
	check_error
done

for dir in ${distr_dirs[@]}; do
	rsync -av --exclude=".*" $dir $version_dir/
	check_error
done

for dir in ${distr_lib_dirs[@]}; do
	rsync -av --exclude=".*" $dir $version_dir/lib/
	check_error
done

for file in ${rm_files[@]}; do
	echo "removing $file..."
	rm -rf $version_dir/$file
	check_error
done

cd $version_dir
echo "removing file(s) not needed..."
find . -name "*.scss" | xargs rm -f
echo "removing hidden file(s)..."
find . -name ".DS_Store"  | xargs rm -f

echo packaging...
tar -zcf $tar_file *

echo uploading...
scp $tar_file $upload_user@$upload_server:$upload_dir/

echo deploying...
deploy_cmd="cd $upload_dir; rm -rf `ls | grep -v .tar.gz`; tar -xvf $tar_file_name; ls"
ssh $upload_user@$upload_server $deploy_cmd

