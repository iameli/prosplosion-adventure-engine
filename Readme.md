The Prosplosion Adventure Engine
=================================

Building
--------

PAE is built using Google Closure Compiler through the plovr build tool. Install plovr with npm, then

    plovr build plovr-release.json
    
to get a release build. 

Testing
--------

The test suite is also built with plovr.

    plovr build plovr-test.json
    
will build a version of PAE that runs the testing suite on startup and outputs the results.