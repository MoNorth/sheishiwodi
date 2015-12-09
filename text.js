// var a = {
// 	a : [1],b : [2]
// };
// var b = {};
// b.a = a.b;
// delete a.b;
// console.log(b);


// console.log(Math.ceil(Math.random()*20));
// 
// 
var a = ["12","23","12","123"];
for(var i in a)
{
	console.log(i);
	if(i - 0  === a.length - 1)
		console.log(a[i]);
}