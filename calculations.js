var fs = require('fs')

var breed = JSON.parse(fs.readFileSync("./breed.json"))
breed.forEach((x) => {
	var r = ["hp","armor","hitmass"]
	r.forEach((t) => {
		x[t] = parseInt(x[t])
	})
})
var attack = JSON.parse(fs.readFileSync("./attack.json"))

/*stats example:
{
	skaven: 0.1,
	chaos: 0,
	armor: [0.1,0,0,0,0,0],
	crit: 1,
	crit_power: 0,
	headshot: 1,
	backstab: 0,
	boost: 0
}*/

function calculate_damage(stats,attack,breed) {
	let powervs = (1 + stats.armor[breed.armor - 1])*(1 + stats[breed.race])
	let base =  powervs * attack.damage * ((stats.crit==0)?attack.multiplier[breed.armor - 1]:attack.multiplier_crit[breed.armor - 1])
	
	let resistant = (breed.armor == 3)?1:0
	let crit_or_hs = 
		stats.crit*stats.headshot*(attack.crit_headshot[resistant] - 1) +
		stats.crit*(1-stats.headshot)*(attack.headshot[resistant] - 1) + 
		(1 - stats.crit)*stats.headshot*(attack.crit - 1)
	let backstab = stats.backstab*(1.5 - 1)
	let boost = stats.boost*(attack.boost[breed.armor - 1] - 1)
	
	let damage = 0.25*Math.round(4* base*(1 + crit_or_hs + backstab + boost) )
	return damage
}

/*let an = Math.round(Math.random()*attack.length)
let bn = Math.round(Math.random()*breed.length)
if(process.argv.length>=4) {
	an = parseInt(process.argv[3])
	bn = parseInt(process.argv[4])
}
var a1 = attack[an]
console.log(a1)
var b1 = breed[bn]
console.log(b1)

console.log("damage: "+calculate_damage({
	skaven: 0,
	chaos: 0,
	armor: [0,0,0,0,0,0],
	crit: 0,
	crit_power: 0,
	headshot: 0,
	backstab: 0,
	boost: 0
},a1,b1))*/


function attack_name(attack) {
	return attack.class+"___"+attack.weapon+"___"+attack.attack
}

function body_breakpoints(output) {
	let breakpoints = {}
	let stats = {
		skaven: 0,
		chaos: 0,
		armor: [0,0,0,0,0,0],
		crit: 0,
		crit_power: 0,
		headshot: 0,
		backstab: 0,
		boost: 0
	}

	for(var x in attack) {
		var s = attack_name(attack[x])
		breakpoints[s] = {}
		breed.forEach(function (br) {
			let d = calculate_damage(stats,attack[x],br)
			let hits = Math.ceil(br.hp/d) - 1
			if(d==0 || hits == 0) breakpoints[s][br.name] = 0
			else breakpoints[s][br.name] = br.hp/(hits*d) - 1
		})
	}
	
	fs.writeFileSync(output,JSON.stringify(breakpoints))
}

body_breakpoints("body.json")