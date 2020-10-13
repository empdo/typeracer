var code = 'function positionIndex()'

var light = lowlight.highlight('js', code)

/*var processor = unified().use(rehype.stringify)
    
console.log(lights.value)

var html = processor.stringify({type: 'root', children: light.value}).toString()

console.log(html);*/
var html = hastUtilToHtml({type: 'root', children: light.value});
console.log(html);
document.write(html);

function positionIndex() {

}