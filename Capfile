
node = 'node-v0.6.6'
url = "http://nodejs.org/dist/v0.6.6/#{node}.tar.gz"

set :app, 'node'
role :server, 'username@server.com' 

namespace :node do 

  task :setup do 
    run <<-CMD
mkdir node &&
cd node &&
wget #{url} &&
tar zxvf #{node}.tar.gz &&
cd #{node} &&
./configure && make &&
sudo make install &&
cd ~/ &&
rm -rf node
CMD
  end

  task :upload do 
    upload(Dir['.'])
    run <<-CMD
CMD
  end
  
end
