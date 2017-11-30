define('modules/b',['modules/c','d'],function(c,d){
	console.log('Module b:Module "b" is loaded.');
	console.log('Module b:I got '+c.name+' and '+d.name+'.');
	return {name:'Module b'};
});