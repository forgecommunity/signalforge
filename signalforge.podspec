require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'signalforge'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.homepage     = package['homepage']
  s.authors      = package['author']
  s.platform     = :ios, '13.0'

  s.source       = { :git => package['repository']['url'], :tag => "v#{s.version}" }
  s.source_files = 'src/native/**/*.{h,cpp,mm}'
  s.public_header_files = 'src/native/**/*.h'
  s.preserve_paths = ['src/native/**/*']
  s.header_dir   = 'SignalForge'

  s.requires_arc = true
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'CLANG_CXX_LIBRARY' => 'libc++',
    'HEADER_SEARCH_PATHS' => '$(PODS_ROOT)/Headers/Public/**'
  }

  s.dependency 'React-Core'
  s.dependency 'React-jsi'
end
