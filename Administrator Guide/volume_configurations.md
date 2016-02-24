## Volume set options

Volume options is a a very important part of volume management. These volume options define the characteristics of any volume. If no volume options are changed, the defaults are used. These options can be feature enabler/disabler or performance tunables or an option for a feature. There are ~200 options in gluster.

1. To list all the volume options available in gluster, their default value, and their desription:
	`# gluster volume set help`

2. To check what options of a volume are changed,
	`# gluster volume info`

3. To set a volume option:
	`# gluster volume set <VOLNAME> <KEY> <VALUE>`

4. To reset a volume option to default:
	`# gluster volume reset <VOLNAME> <KEY> [force]`

   To reset all volume options to default:
	`# gluster volume reset <VOLNAME> [force]`

Note: Each volume option should be enabled as specified in the feature document. Every option has its own charecteristic, i.e. few options can be changed dynamically without restarting volume or processes, few options will be effective only after restart of the volume/processes, few options require other options to be enabled to work etc. Hence use it as specified in the documentation.
