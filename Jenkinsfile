#!/usr/bin/groovy
@Library('github.com/fabric8io/fabric8-pipeline-library@master')
@Library('github.com/openfactio/openfact-pipeline-library@master')
def utils = new io.fabric8.Utils()
def org = 'openfact-ui'
def repo = 'ngo-openfact-sync'
openfactUINode{
    ws {
      git "https://github.com/${org}/${repo}.git"
      readTrusted 'release.groovy'
      sh "git remote set-url origin git@github.com:${org}/${repo}.git"
      def pipeline = load 'release.groovy'

      if (utils.isCI()){
        container('ui'){
          pipeline.ci()
        }
      } else if (utils.isCD()){
        def branch
        container('ui'){
            branch = utils.getBranch()
        }
        
        def published
        container('ui'){
          published = pipeline.cd(branch)
        }

        def releaseVersion
                
        container('ui'){
          sh "whoami"
          sh "ls -l /root/.ssh-git"
          sh "ls -l /root/.ssh-git/ssh-key"
          sh "ls -l /root/.ssh-git/ssh-key.pub"
          sh "ssh-keygen -t rsa -b 4096"
          releaseVersion = utils.getLatestVersionFromTag()
        }

        if (published){
          pipeline.updateDownstreamProjects(releaseVersion)
        }
      }
    }
}
