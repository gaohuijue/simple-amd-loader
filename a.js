define('a',['modules/b','modules/c'],function(b,c){
	console.log('Module a:Module "a" is loaded.');
	console.log('Module a:I got '+b.name+' and '+c.name+'.');
	return {name:'Module a'};
});