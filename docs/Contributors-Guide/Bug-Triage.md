Issues Triage Guidelines
========================

-   Triaging of issues is an important task; when done correctly, it can
    reduce the time between reporting an issue and the availability of a
    fix enormously.

-   Triager should focus on new issues, and try to define the problem
    easily understandable and as accurate as possible. The goal of the
    triagers is to reduce the time that developers need to solve the bug
    report.

-   A triager is like an assistant that helps with the information
    gathering and possibly the debugging of a new bug report. Because a
    triager helps preparing a bug before a developer gets involved, it
    can be a very nice role for new community members that are
    interested in technical aspects of the software.

-   Triagers will stumble upon many different kind of issues, ranging
    from reports about spelling mistakes, or unclear log messages to
    memory leaks causing crashes or performance issues in environments
    with several hundred storage servers.

Nobody expects that triagers can prepare all bug reports. Therefore most
developers will be able to assist the triagers, answer questions and
suggest approaches to debug and data to gather. Over time, triagers get
more experienced and will rely less on developers.

**Issue triage can be summarized as below points:**

-   Is the issue a bug? an enhancement request? or a question? Assign the relevant label.
-   Is there enough information in the issue description?
-   Is it a duplicate issue?
-   Is it assigned to correct component of GlusterFS?
-   Is the bug summary is correct?
-   Assigning issue or Adding people's github handle in the comment, so they get notified.

The detailed discussion about the above points are below.

Is there enough information?
----------------------------

It's hard to generalize what makes a good report. For "average"
reporters is definitely often helpful to have good steps to reproduce,
GlusterFS software version , and information about the test/production
environment, Linux/GNU distribution.

If the reporter is a developer, steps to reproduce can sometimes be
omitted as context is obvious. *However, this can create a problem for
contributors that need to find their way, hence it is strongly advised
to list the steps to reproduce an issue.*

Other tips:

-   There should be only one issue per report. Try not to mix related or
    similar looking bugs per report.

-   It should be possible to call the described problem fixed at some
    point. "Improve the documentation" or "It runs slow" could never be
    called fixed, while "Documentation should cover the topic Embedding"
    or "The page at <http://en.wikipedia.org/wiki/Example> should load
    in less than five seconds" would have a criterion. A good summary of
    the bug will also help others in finding existing bugs and prevent
    filing of duplicates.

-   If the bug is a graphical problem, you may want to ask for a
    screenshot to attach to the bug report. Make sure to ask that the
    screenshot should not contain any confidential information.

Is it a duplicate?
------------------

If you think that you have found a duplicate but you are not totally
sure, just add a comment like "This issue looks related to issue #NNN" (and
replace NNN by issue-id) so somebody else can take a look and help judging.


Is it assigned with correct label?
----------------------------------

Go through the labels and assign the appropriate label

Are the fields correct?
-----------------------

### Description

Sometimes the description does not summarize the bug itself well. You may
want to update the bug summary to make the report distinguishable. A
good title may contain:

-   A brief explanation of the root cause (if it was found)
-   Some of the symptoms people are experiencing

### Adding people to 'watch list' or changing the "Assigned to" field

Normally, developers and potential assignees of an area are already
watching all the issues by default, but sometimes reports describe general
issues. Only if you know developers who work in the area covered by the
issue, and if you know that these developers accept getting CCed or assigned
to certain reports, you can add that person to the CC field or even assign
the bug report to her/him.

To get an idea who works in which area, check To know component owners ,
you can check the "MAINTAINERS" file in root of glusterfs code directory
or querying changes in [Gerrit](http://review.gluster.org) (see
[Simplified dev workflow](/Developer-guide/Simplified-Development-Workflow.md))

### Bugs present in multiple Versions

During triaging you might come across a particular bug which is present
across multiple version of GlusterFS. Add that in comment.
