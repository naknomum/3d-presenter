3D Object Presenter
===================

Objective
---------
The goal is to make a simple-to-use website (or library to extend a website) which allows a user to take a 3D object (its geometry and texture files) and create a way to showcase this object in a browser, in order to share or display the object.  Such a site could function as a sort of [**imgur**](http://imgur.com) of 3D objects.

***Target criteria included:***

1. **unique url** per object
2. simple **drag and drop** of file(s) to browser
3. available to both **anonymous and registered** users
4. auto-creation of **snapshot** pngs (available to download)
5. viewers (not just creator) can **interact and move** object (as well as take snapshots)

Project Status
--------------

The project is relatively simple thanks largely to the great [three.js](http://threejs.org) project. I have worked a little on the mechanism that creates the unique urls, (wordless) ui work for snapshots and other functions, and some steps toward authenticating for editing (via a different url) and some other features.

![image of current version](https://raw.githubusercontent.com/naknomum/3d-presenter/master/grab.png)

At this point, I do not have time to pursue the project and thus am putting it on github if anyone is interested.  There are still challenges to solve (security considerations, bugs, etc.), but the results so far have been encouraging to me.  It seems with the proliferation of 3D design, a site for _displaying_ works (as opposed to trading the source files, like _thingiverse_ etc.) in a simple way might be useful.

Demonstration
-------------

I have set up a temporary **demo site** of the current implementation at [3d.sito.org](http://3d.sito.org).  For security and space reasons, _saving has been disabled_, so some features (such as multiple snapshots and edit-url) do not work.

When arriving at the site, you should be redirected to a unique url (which is kind of worthless with saving disabled) and a blank page.  You should then **drag an _.obj_ file (and optional texture _.png_ or _.jpg_)** onto the page.  With any luck, your object should appear and can be moved around.  The thumbnail in the upper-left should update when you let go of the mouse.  Clicking the _download_ icon in the corner of the thumbnail should download the png to your computer.  Only modern browsers, please.

