var a = {
	a : [1],b : [2]
};
var b = {};
b.a = a.b;
delete a.b;
console.log(b);