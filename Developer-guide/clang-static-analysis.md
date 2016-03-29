Clang Static Analysis
---------------------
#### About Clang:

From a very high level view, Clang has two features

1. Clang as a compiler  
2. Clang as a code analyzer  

The Idea here is to use second i.e Clang as code analyzer and still gcc will be our default compiler.  
Clang Static Analyzer is a source code analysis tool that finds bugs in C, C++, and Objective-C programs. Given the exact same code base, clang-analyzer reported ~70 potential issues. clang is an awesome and free tool.  
Reports from clang-analyzer are in HTML, there will be single html file for each bug and on top there will 'index.html' that has links to all bugs(html files) by category, the html view of source code will also contain embedded comments about the bug, also shows the flow of code execution all the way down to the problem.  

#### Why Clang Analyzer:

* Since its is an open source tool, hence available to all the developers
* Easy Access, we can run the tool while we compile the code
* No restrictions on Number of Runs per week/day/hour/min ..
* Defects in the code are Identified before submitting a patch, thus very less chance of defect injection into project

The Html view of clang is very impressive with all the source code including comments of clang-analyzer, which lead us to defect line number directly.

#### How we are using clang analyzer in gluster?

I have included 'extras/clang-checker.sh' that will automate everything for you, it got integrated with makefile with target 'clang-check'.  

When you make some changes to project commit it; before you run 'rfc.sh' just type 'make clang-check', this will run clang static analyzer on your changes and check for possible bugs. In case if it found some bugs it will report them in html file.  
Basically, 'extras/clang-checker.sh' runs clang analyzer with and without the HEAD commit, and shows the bugs introduced by HEAD commit (if any).  

##### Here is sample run for you:
```
$[ glusterfs ]: make clang-check

================ Clang analyzer in progress ================
...

BASELINE BUGS LIST (before applying patch):
------------------------------------------
Out of bound array access --> 3
Memory leak --> 1
Unix API --> 24
Dead increment --> 5
Dereference of null pointer --> 1995
Uninitialized argument value --> 2
All Bugs --> 2872
Called function pointer is null null dereference --> 4
Dead initialization --> 49
Dead assignment --> 691
Undefined allocation of 0 bytes CERT MEM0 C CWE --> 5
Argument with nonnull attribute passed null --> 84
Result of operation is garbage or undefined --> 9

TARGET BUGS LIST (after applying patch):
---------------------------------------
Out of bound array access --> 3
Memory leak --> 1
Unix API --> 24
Dead increment --> 5
Dereference of null pointer --> 1995
Uninitialized argument value --> 2
All Bugs --> 2872
Called function pointer is null null dereference --> 4
Dead initialization --> 49
Dead assignment --> 694
Undefined allocation of 0 bytes CERT MEM0 C CWE --> 5
Argument with nonnull attribute passed null --> 84
Result of operation is garbage or undefined --> 9

SUMMARY OF CLANG-ANALYZER:
-------------------------
Extra 3 Bug[s] Introduced in: Dead assignment

Patch Value given by Clang analyzer '-1'

Explore complete results at
~/work/glusterfs/baseline/results/index.html
~/work/glusterfs/target/results/index.html

================= Done with Clang Analysis =================
```
