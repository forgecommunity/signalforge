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

  if respond_to?(:install_modules_dependencies)
    install_modules_dependencies(s)
  end

  if ENV['RCT_NEW_ARCH_ENABLED'] == '1'
    s.pod_target_xcconfig = s.pod_target_xcconfig.merge({
      'HEADER_SEARCH_PATHS' => '$(PODS_ROOT)/Headers/Public/** $(PODS_ROOT)/Headers/Private/React-Codegen'
    })

    s.compiler_flags = (s.compiler_flags || '') + ' -DRCT_NEW_ARCH_ENABLED=1'

    s.dependency 'React-Codegen'
    s.dependency 'React-callinvoker'
    s.dependency 'React-runtimeexecutor'
    s.dependency 'ReactCommon/turbomodule/core'
    s.dependency 'RCT-Folly'
    s.dependency 'RCTRequired'
    s.dependency 'RCTTypeSafety'
  end
end
