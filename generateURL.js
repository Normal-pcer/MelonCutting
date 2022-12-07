encode = (s) => {
    return btoa(encodeURI(s));
};

let d = {
    datatype: prompt('datatype:'),
    chart: encode(prompt('chart:')),
    illu: encode(prompt('illu:')),
    music: encode(prompt('music:')),
    name: encode(prompt('name:')),
    level: encode(prompt('level:')),
    ca: encode(prompt('ca:')),
    ia: encode(prompt('ia:')),
};

let res = 'https://www.example.com/meloncutting/player.html?';

for (let i in d) {
    v = d[i];
    res = res + i + '=' + v + '&';
}

res = res.substring(0, res.length - 1);

console.log(res);
