#!/usr/bin/perl

my $domain = 'http://3d.sito.org';
my $rootdir = '/var/www/3d';

use Data::Dumper;
use Digest::MD5 qw (md5_hex);
use JSON;
use CGI;

my $cgi = new CGI;
my $id = $cgi->param('id');
my $file = $cgi->param('upfile');

my $json = $cgi->param('json');
&saveJSON($json) if $json;  #will exit




my $path = substr($ENV{REQUEST_URI},5);
$path = $` if ($path =~ /\/+$/);
#print "Content-type: text/plain\n\n($path)"; exit;


my $key;
if ($path =~ /\/([^\/]+)$/) {
	$path = $`;
	$key = $1;
}

my $fullPath = "$rootdir/obj/$path";
#print "Content-type: text/plain\n\n(path=$path) (key=$key) (fullPath=$fullPath)"; exit;
$path = '' unless &validID($path);

#print "Content-type: text/plain\n\n($path)";

if (!$path) {
	my $id = md5_hex(rand(217000) . time . $$);
	print "Location: $domain/obj/$id\n\n";
	exit;
}



my $data = &getData($path);

$data->{key} = $key if ($key && (-f "$fullPath/key.$key"));

my $js = 'var data = ' . to_json($data) . ';' if $data;

print 'Content-type: text/html

<html><head><title>3d.objs</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="/css/style.css" type="text/css" />
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src="/js/three.js/build/three.js"></script>
    <script src="/js/three.js/examples/js/controls/TrackballControls.js"></script>
    <script src="/js/three.js/examples/js/loaders/OBJLoader.js"></script>
    <script src="/js/three.js/examples/js/exporters/SceneExporter.js"></script>
    <script src="/js/three.js/examples/js/exporters/ObjectExporter.js"></script>
    <script src="/js/three.js/examples/js/Detector.js"></script>
<script type="text/javascript" src="/js/files.js"></script>
<script src="/js/3d_viewer.js"></script>

<script src="/js/effects.js"></script>
<script src="/js/app.js"></script>
<script type="text/javascript">' . $js . '</script>

</head>
<body>
<div id="busy"></div>

<div class="ui-toggle ui-toggle-ul" id="ui-help-wrapper">
	<div id="ui-help-icon" class="ui ui-toggle-tiny"><span class="icon icon-help"></span></div>
	<div id="ui-help" class="ui ui-toggle-big">longer text</div>
</div>

<div class="ui-toggle ui-toggle-ur" id="ui-tools-wrapper">
	<div id="ui-tools-icon" class="ui ui-toggle-tiny"><span class="icon icon-tools"></span></div>
	<div id="ui-tools" class="ui ui-toggle-big"></div>
</div>

<div id="ui-messages"></div>

<div id="ui-save-wrapper"></div>


</body>
</html>';



sub getData {
	my ($id) = shift;
	my $file = "$rootdir/obj/$id/data.json";
	my $d = { id => $id };
	if (!open(F, $file)) {
		$d->{new} = 1;
		return $d;
	}

	$d = from_json(join('',<F>));
	return $d;
}



sub saveJSON {
	#return { error => 'saving disabled' };
	my $data = from_json(shift);  #TODO trap errors
#warn Dumper($data);

	my $rtn = { ok => 1 };
	my $dir = "$rootdir/obj/$data->{id}";

	if (!$data->{id} || !&validID($data->{id})) {
		$rtn = { error => "invalid ID $data->{id}" };

#TODO other security on $dir ?

	} elsif (!-d $dir) {
		mkdir($dir, 0776);
		$data->{created} = time;
		$rtn->{key} = &makeKey($dir);

	} elsif (!$data->{key} || !-f "$dir/key.$data->{key}") {
		$rtn = { error => "invalid key" };
	}


print STDERR "----------------------------------------------------------------------\n" . Dumper($rtn) . "-------------------------------------------------\n";

	if (!$rtn->{error}) {
		$rtn->{snaps} = &saveSnap($dir, $data) if $data->{snap};
		$rtn->{fileData} = &saveFiles($dir, $data) if $data->{fileData};
		$data->{modified} = time;
		if (open(F, ">$dir/data.json")) {
			print F to_json($data);
			close(F);
		}
	}

	print "Content-type: text/plain\n\n" . to_json($rtn);
	exit;
}



sub validID {
	my ($id) = shift;
	#return unless (length($id) == 32);
	return unless ($id =~ /^[0-9a-f]{32}$/);
	return 1;
}


sub makeKey {
	my $dir = shift;
	my $key = sprintf('%x', rand(217000));
	open(K, ">$dir/key.$key") || return;
	print K time . "\n";
	close(K);
	return $key;
}


sub saveSnap {
	use MIME::Base64;
	my $maxNum = 4;
	my ($dir, $data) = @_;

	my $i = 0;
	$i = $data->{snaps}->[0] + 1 if ($data->{snaps} && $data->{snaps}->[0]);
	$i = 0 if ($i >= $maxNum);  #wrap
	my $png = decode_base64($data->{snap});

	open(P, ">$dir/$i.png");
	print P $png;
	close(P);

	#always most recent
	open(P, ">$dir/img.png");
	print P $png;
	close(P);

	system("/usr/bin/convert -quality 70% -scale 175x $dir/img.png $dir/img-thumb.jpg");

	delete($data->{snap});

	unshift(@{$data->{snaps}}, "$i.png");
	pop(@{$data->{snaps}}) while (scalar(@{$data->{snaps}}) > $maxNum);
	return $data->{snaps};
}



sub saveFiles {
	use MIME::Base64;
	my ($dir, $data) = @_;

	for my $f (@{$data->{fileData}}) {
		my $content = decode_base64($f->{b64});
		my $fname = $f->{file}->{name} || substr($f->{b64},0,8);
		delete($f->{b64});
		open(D, ">$dir/$fname");
		print D $content;
		close(D);
	}

	return $data->{fileData};
}


