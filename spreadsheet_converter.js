/*breed example:
{
	name: "skaven_slave",
	race: "skaven",
	armor: 1,
	hp: 7.5,
	hitmass: 2
}*/

/*attack example:
{
	class: "dwarf",
	weapon: "one_hand_axe_template_2",
	attack: "light_attack_left",
	cleave: "2,925",
	damage: "18,33",
	multipliers: [1,0.75,1.5,0.75,0.75],
	multipliers_crit: [1,0.75,1.5,1,0.75],
	crit: 1.5,
	headshot: [1.25,1.5],
	crit_headshot: [1.75,2],
	boost: [1.75,1.6,1.5,1.5,1.3]
}*/

var live_to_beta = 575/800

var fs = require('fs')

function parse_breed(input,output) {
	var s = fs.readFileSync(input,'utf8')
	let ls = s.split("\r\n")
	let breed = []
	for(var x in ls) {
		if(ls[x]=="") continue
		t = ls[x].split(',')
		breed[x] = {
			name: t[1],
			race: t[3],
			armor: t[4],
			hp: t[10],
			hitmass: t[14].replace(/[\.\d]+ \(([\.\d]+)\)/,"$1")
		}
	}
	fs.writeFileSync(output,JSON.stringify(breed))
	return breed
}

parse_breed("./Vermintide 2 Breed Data - 1.0.4.csv","./breed.json")

function power_scale(base,scale) {
	return (base+scale*60)*575/800
}

function parse_attacks(input,output) {
	var s = fs.readFileSync(input,'utf8')
	let ls = s.split("\r\n")
	let attack = []
	let last_class = ""
	let last_weapon = ""
	let last_attack = ""
	for(var x in ls) {
		if(ls[x]=="") continue
		t = ls[x].split(',')
		if(t[0]!="") last_class = t[0]
		if(t[1]!="") last_weapon = t[1]
		if(t[2]!="") last_attack = t[2]
		attack[x] = {
			class: last_class,
			weapon: last_weapon,
			attack: last_attack,
			targets: t[6],
			cleave: power_scale(parseFloat(t[4]),parseFloat(t[5])),
			damage: power_scale(parseFloat(t[7]),parseFloat(t[8])),
			multiplier: [t[9],t[10],t[11],t[12],t[13],t[14]],
			multiplier_crit: [t[15],t[16],t[17],t[18],t[19],t[20]],
			crit: t[21],
			headshot: [t[22],t[23]],
			crit_headshot: [t[24],t[25]],
			boost: [t[26],t[27],t[28],t[29],t[30],t[31]]
		}
	}
	fs.writeFileSync(output,JSON.stringify(attack))
	return attack
}

parse_attacks("./Vermintide 2 Melee Damage - 1.0.5.csv","./attack.json")