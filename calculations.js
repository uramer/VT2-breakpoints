var fs = require('fs')

var breed = JSON.parse(fs.readFileSync("./breed.json"))
var attack = JSON.parse(fs.readFileSync("./attack.json"))

let body_stats = {
	skaven: 0,
	chaos: 0,
	armor: [0,0,0,0,0,0],
	crit: 0,
	crit_power: 0,
	headshot: 0,
	backstab: 0,
	boost: 0
}
let head_stats = {
	skaven: 0,
	chaos: 0,
	armor: [0,0,0,0,0,0],
	crit: 0,
	crit_power: 0,
	headshot: 1,
	backstab: 0,
	boost: 0
}

let crit_stats = {
	skaven: 0,
	chaos: 0,
	armor: [0,0,0,0,0,0],
	crit: 1,
	crit_power: 0,
	headshot: 0,
	backstab: 0,
	boost: 0
}
let crit_head_stats = {
	skaven: 0,
	chaos: 0,
	armor: [0,0,0,0,0,0],
	crit: 1,
	crit_power: 0,
	headshot: 1,
	backstab: 0,
	boost: 0
}

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
	an = parseInt(process.argv[2])
	bn = parseInt(process.argv[3])
}
var a1 = attack[an]
console.log(a1)
var b1 = breed[bn]
console.log(b1)

console.log("damage: "+calculate_damage(body_stats,a1,b1))*/


function attack_name(attack) {
	return attack.class+"_"+attack.weapon+"___"+attack.attack+"___"+attack.targets
}

function JSONreadable(s) {
	return s.replace("},","},\n")
}

function breakpoints_to_csv(breakpoints,output) {
	let s = ""
	s = "weapon,attack,targets,"
	breed.forEach((x)=>{
		s+=x.name+","
	})
	s+="\n"
	
	for(var x in breakpoints) {
		x.split("___").forEach((t) => {
			s+=t+","
		})
		breed.forEach((t)=>{
			s+=breakpoints[x][t.name]+","
		})
		s+="\n"
	}
	
	if(output) fs.writeFileSync(output,s)
	return s
}

function round_to_2(x) {
	return x.toFixed(2)
}

function breakpoints(stats,output) {
	let breakpoints = {}

	for(var x in attack) {
		var s = attack_name(attack[x])
		breakpoints[s] = {}
		breed.forEach(function (br) {
			let d = calculate_damage(stats,attack[x],br)
			let hits = Math.ceil(br.hp/d) - 1
			if(d==0 || hits == 0) breakpoints[s][br.name] = 0
			else breakpoints[s][br.name] = round_to_2(br.hp/(hits*d) - 1)
		})
	}
	
	fs.writeFileSync(output,JSONreadable(JSON.stringify(breakpoints)))
	
	return breakpoints
}

breakpoints_to_csv(breakpoints(body_stats,"body.json"),"body.csv")
breakpoints_to_csv(breakpoints(head_stats,"head.json"),"head.csv")
breakpoints_to_csv(breakpoints(crit_stats,"crit.json"),"crit.csv")
breakpoints_to_csv(breakpoints(crit_head_stats,"crit_head.json"),"crit_head.csv")