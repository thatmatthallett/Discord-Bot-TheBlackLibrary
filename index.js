const fetch = require('node-fetch'); // install from here https://www.npmjs.com/package/node-fetch
const tokenfile = require("./token.json");
const rules = require("./rules.json");
const Discord = require("discord.js");
require('events').EventEmitter.defaultMaxListeners = 300;
const bot = new Discord.Client({disableEveryone: true})

function rfc3986EncodeURIComponent (str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, escape).replace("%2C",",");
}

//Card Name Output function
function nameOutput(message, card){
	// create embed
	var botembed = new Discord.RichEmbed()
	var	title = card.alliance + " - " + card.category.en
	var desc = card.effect.en
	var regex = /X /g

	//check Alliance to set color
	switch(card.alliance){
		case 'Order':
			botembed.setColor(9075540)
			break;
		case 'Chaos':
			botembed.setColor(8210493)
			break;
		case 'Death':
			botembed.setColor(5723747)
			break;
		case 'Destruction':
			botembed.setColor(5923385)
			break;
		default:
			botembed.setColor(13224393)
	}
	//Set Author and Champion Specific Fields
	var encodedName = rfc3986EncodeURIComponent(card.name)
	switch(card.category.en){
		case 'Blessing':
			botembed.setAuthor(card.name,'https://assets.warhammerchampions.com/card-database/icons/category_blessing.png?1','https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+encodedName)
			break;
		case 'Unit':
			botembed.setAuthor(card.name,'https://assets.warhammerchampions.com/card-database/icons/category_unit.png?1','https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+encodedName)
			break;
		case 'Spell':
			botembed.setAuthor(card.name,'https://assets.warhammerchampions.com/card-database/icons/category_spell.png?1','https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+encodedName)
			break;
		case 'Ability':
			botembed.setAuthor(card.name,'https://assets.warhammerchampions.com/card-database/icons/category_ability.png?1','https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+encodedName)
			break;
		default:
			botembed.setAuthor(card.name,'','https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+encodedName)
			.addField('Health Modifier', card.healthMod,true)
			.addField('Cost', card.cost,true)
			var questCorners = ""
			for(i=0;i < card.corners.length;i++){
				questCorners += card.corners[i].value
				if (typeof card.corners[i].qualifier != "undefined"){
					questCorners += " (" + card.corners[i].qualifier + ")"
					if ( i != (card.corners.length - 1) ) { questCorners += " / " }
				} else {
					if ( i != (card.corners.length - 1) ) { questCorners += " / " }
				}
			}
			botembed.addField('Quest Corners', questCorners)
	}
	//Set Title console.log(card.class)
	if (typeof card.class != "undefined"){ title += ", " + card.class.en }
	botembed.setTitle(title)
	// Set the main content of the embed
	.setDescription(desc.replace(regex,'↺ '))

	//Set Corners if not Champion
	if (card.category.en != "Champion" && card.corners.length > 0){
		var corner = ""
		var cValues = ""
		
		if ( card.corners[0].smooth ) { corner = "Smooth Corners" }
		else { corner = "Clunky Corners" }

		for(i=0;i < card.corners.length;i++){
			cValues += card.corners[i].value
			if ( i != (card.corners.length - 1) ) { cValues += " / " }
		}

		botembed.addField(corner,cValues)
	}
	
	// Thumbnail for the embed console.log(card.subjectImage)
	if (typeof card.subjectImage != "undefined") {
		botembed.setThumbnail ("https://assets.warhammerchampions.com/card-database/icons/subject_"+ card.subjectImage +".png?0")
	}
	//Set Tags console.log(card.tags.length)
	if(card.tags.length > 0){
		botembed.addField('Tags',card.tags.join(", "))
	}
	//Set Footer
	switch(card.rarity){
		case 'Exclusive':
			botembed.setFooter(card.collectorInfo,"https://assets.warhammerchampions.com/card-database/icons/rarity_exclusive.png?1")
			break;
		case 'Rare':
			botembed.setFooter(card.collectorInfo,"https://assets.warhammerchampions.com/card-database/icons/rarity_rare.png?1")
			break;
		case 'Uncommon':
			botembed.setFooter(card.collectorInfo,"https://assets.warhammerchampions.com/card-database/icons/rarity_uncommon.png?1")
			break;
		case 'Common':
			botembed.setFooter(card.collectorInfo,"https://assets.warhammerchampions.com/card-database/icons/rarity_common.png?1")
			break;
	}
	// Send the embed to the same channel as the message
	message.channel.send(botembed);
}
//Card List Output function
function charCountLoop(array){
	const last = array.length - 1
	if( array[last].length >= 1023 ) {
		array.push(array[last].substring(array[last].indexOf('\n',900)+1))
		array[last] = array[last].substring(0,array[last].indexOf('\n',900))
		return charCountLoop(array)
	} else { return array }
}
function factionListEmbed(message, cardList, cmd, wave){
	var champEmbed = new Discord.RichEmbed()
	var blessEmbed = new Discord.RichEmbed()
	var unitEmbed = new Discord.RichEmbed()
	var spellEmbed = new Discord.RichEmbed()
	var abilEmbed = new Discord.RichEmbed()

	//check Alliance to set color
	switch(cardList[0].alliance){
		case 'Order':
			champEmbed.setColor(9929826)
			blessEmbed.setColor(9929826)
			unitEmbed.setColor(9929826)
			spellEmbed.setColor(9929826)
			abilEmbed.setColor(9929826)
			break;
		case 'Chaos':
			champEmbed.setColor(8210493)
			blessEmbed.setColor(8210493)
			unitEmbed.setColor(8210493)
			spellEmbed.setColor(8210493)
			abilEmbed.setColor(8210493)
			break;
		case 'Death':
			champEmbed.setColor(5723747)
			blessEmbed.setColor(5723747)
			unitEmbed.setColor(5723747)
			spellEmbed.setColor(5723747)
			abilEmbed.setColor(5723747)
			break;
		case 'Destruction':
			champEmbed.setColor(5923385)
			blessEmbed.setColor(5923385)
			unitEmbed.setColor(5923385)
			spellEmbed.setColor(5923385)
			abilEmbed.setColor(5923385)
			break;
		default:
			champEmbed.setColor(13224393)
			blessEmbed.setColor(13224393)
			unitEmbed.setColor(13224393)
			spellEmbed.setColor(13224393)
			abilEmbed.setColor(13224393)
	}
	//set Author
	var author = ""

	if ( wave != null || wave != undefined ){
		author += "wave " + cardList[0].set
	}
	for(i=0;i<cmd.length;i++){
		var current = cmd[i].toLowerCase();
		switch (current){
			case "exclusives":
				current = "exclusives"
				break
			case "rares":
				current = "rare"
				break
			case "uncommons":
				current = "uncommon"
				break
			case "commons":
				current = "common"
				break
		}
		if(current === "exclusive" || current === "rare" || current === "uncommon" || current === "common"){
			if ( author.length > 0 ){ author += " " }
			author += current
		}
	}
	for(i=0;i<cmd.length;i++){
		var current = cmd[i].toLowerCase();
		if(current === "order" || current === "chaos" || current === "death" || current === "destruction" || current === "any" || current === "unaligned"){
			if ( author.length > 0 ){ author += " " }
			if ( current === "any" ){ current = "unaligned" }
			author += current
		}
	}
	if ( cmd.indexOf("all") > -1 || (cmd.indexOf(cardList[0].alliance.toLowerCase()) === -1 && cmd.indexOf("unaligned") === -1) ) {
		author += " " + cardList[0].alliance
	}

	champEmbed.setAuthor(author.toUpperCase()+' CHAMPIONS')
	blessEmbed.setAuthor(author.toUpperCase()+' BLESSINGS','https://assets.warhammerchampions.com/card-database/icons/category_blessing.png?1')
	unitEmbed.setAuthor(author.toUpperCase()+' UNITS','https://assets.warhammerchampions.com/card-database/icons/category_unit.png?1')
	spellEmbed.setAuthor(author.toUpperCase()+' SPELLS','https://assets.warhammerchampions.com/card-database/icons/category_spell.png?1')
	abilEmbed.setAuthor(author.toUpperCase()+' ABILITIES','https://assets.warhammerchampions.com/card-database/icons/category_ability.png?1')

	//Sort Cards by Category
	var champions = ""
	var blessings = ""
	var units = ""
	var spells = ""
	var abilities = ""
	for(i=0;i<cardList.length;i++){
		var encodedName = rfc3986EncodeURIComponent(cardList[i].name)
		switch ( cardList[i].category.en ){
			case 'Champion':
				champions += '['+ cardList[i].name +'](https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+ encodedName +')\n'
				break;
			case 'Blessing':
				blessings += '['+ cardList[i].name +'](https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+ encodedName +')\n'
				break;
			case 'Unit':
				units += '['+ cardList[i].name +'](https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+ encodedName +')\n'
				break;
			case 'Spell':
				spells += '['+ cardList[i].name +'](https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+ encodedName +')\n'
				break;
			case 'Ability':
				abilities += '['+ cardList[i].name +'](https://www.warhammerchampions.com/decks-and-packs/card-database/en/card/'+ encodedName +')\n'
				break;
		}
	}
	
	if (champions.length >= 1023) {
		var champArray = [champions.substring(0,champions.indexOf('\n',900)),champions.substring(champions.indexOf('\n',900)+1)]
		var champEmbedArray = charCountLoop(champArray);
		for(i=0;i<champEmbedArray.length;i++){ champEmbed.addField('Group'+(i+1),champEmbedArray[i]); }
	} else { if (champions.length > 0){ champEmbed.setDescription(champions); } }
	if (blessings.length >= 1023) {
		var blessArray = [blessings.substring(0,blessings.indexOf('\n',900)),blessings.substring(blessings.indexOf('\n',900)+1)]
		var blessEmbedArray = charCountLoop(blessArray);
		for(i=0;i<blessEmbedArray.length;i++){ blessEmbed.addField('Group'+(i+1),blessEmbedArray[i]); }
	} else { if (blessings.length > 0){ blessEmbed.setDescription(blessings); } }
	if (units.length >= 1023) {
		var unitArray = [units.substring(0,units.indexOf('\n',900)),units.substring(units.indexOf('\n',900)+1)]
		var unitEmbedArray = charCountLoop(unitArray);
		for(i=0;i<unitEmbedArray.length;i++){ unitEmbed.addField('Group'+(i+1),unitEmbedArray[i]); }
	} else { if (units.length > 0){ unitEmbed.setDescription(units); } }
	if (spells.length >= 1023) {
		var spellArray = [spells.substring(0,spells.indexOf('\n',900)),spells.substring(spells.indexOf('\n',900)+1)]
		var spellEmbedArray = charCountLoop(spellArray);
		for(i=0;i<spellEmbedArray.length;i++){ spellEmbed.addField('Group'+(i+1),spellEmbedArray[i]); }
	} else { if (spells.length > 0){ spellEmbed.setDescription(spells); } }
	if (abilities.length >= 1023) {
		var abilArray = [abilities.substring(0,abilities.indexOf('\n',900)),abilities.substring(abilities.indexOf('\n',900)+1)]
		var abilEmbedArray = charCountLoop(abilArray);
		for(i=0;i<abilEmbedArray.length;i++){ abilEmbed.addField('Group'+(i+1),abilEmbedArray[i]); }
	} else { if (abilities.length > 0){ abilEmbed.setDescription(abilities); } }

	if (champions.length > 0){ message.author.send(champEmbed); }
	if (blessings.length > 0){ message.author.send(blessEmbed); }
	if (units.length > 0){ message.author.send(unitEmbed); }
	if (spells.length > 0){ message.author.send(spellEmbed); }
	if (abilities.length > 0){ message.author.send(abilEmbed); }
}
function listOutput(message, cards, cmd){
	// Send the embed to the same channel as the message 
	var orderCards = []
	var chaosCards = []
	var deathCards = []
	var destroCards = []
	var neutralCards = []
	//Split cards into factions
	for(i=0;i<cards.length;i++){
		switch ( cards[i]._source.alliance ) {
			case 'Order':
				orderCards.push(cards[i]._source)
				break;
			case 'Chaos':
				chaosCards.push(cards[i]._source)
				break;
			case 'Death':
				deathCards.push(cards[i]._source)
				break;
			case 'Destruction':
				destroCards.push(cards[i]._source)
				break;
			default:
				neutralCards.push(cards[i]._source)
		}
	}

	if ( orderCards.length > 0 ) {
		//message.channel.send('We have '+ orderCards.length +' order cards');
		var orderSetCards = []
		for(i=0;i<orderCards.length;i++){
			if ( orderSetCards[orderCards[i].set-1] == undefined ){
				orderSetCards.push([orderCards[i]])
			} else {
				orderSetCards[orderCards[i].set-1].push(orderCards[i])
			}
		}
		if ( orderSetCards.legnth > 1 ) {
			// if there are multiple sets
			for(i=0;i<orderSetCards.length;i++){
				factionListEmbed(message,orderSetCards[i],cmd,i+1)
			}
		} else {
			factionListEmbed(message,orderSetCards[0],cmd)
		}
	}
	if ( chaosCards.length > 0 ) {
		//message.channel.send('We have '+ chaosCards.length +' chaos cards');
		var chaosSetCards = []
		for(i=0;i<chaosCards.length;i++){
			if ( chaosSetCards[chaosCards[i].set-1] == undefined ){
				chaosSetCards.push([chaosCards[i]])
			} else {
				chaosSetCards[chaosCards[i].set-1].push(chaosCards[i])
			}
		}
		if ( chaosSetCards.legnth > 1 ) {
			// if there are multiple sets
			for(i=0;i<chaosSetCards.length;i++){
				factionListEmbed(message,chaosSetCards[i],cmd,i+1)
			}
		} else {
			factionListEmbed(message,chaosSetCards[0],cmd)
		}
	}
	if ( deathCards.length > 0 ) {
		//message.channel.send('We have '+ deathCards.length +' death cards');
		var deathSetCards = []
		for(i=0;i<deathCards.length;i++){
			if ( deathSetCards[deathCards[i].set-1] == undefined ){
				deathSetCards.push([deathCards[i]])
			} else {
				deathSetCards[deathCards[i].set-1].push(deathCards[i])
			}
		}
		if ( deathSetCards.legnth > 1 ) {
			// if there are multiple sets
			for(i=0;i<deathSetCards.length;i++){
				factionListEmbed(message,deathSetCards[i],cmd,i+1)
			}
		} else {
			factionListEmbed(message,deathSetCards[0],cmd)
		}
	}
	if ( destroCards.length > 0 ) {
		//message.channel.send('We have '+ destroCards.length +' destro cards');
		var destroSetCards = []
		for(i=0;i<destroCards.length;i++){
			if ( destroSetCards[destroCards[i].set-1] == undefined ){
				destroSetCards.push([destroCards[i]])
			} else {
				destroSetCards[destroCards[i].set-1].push(destroCards[i])
			}
		}
		if ( destroSetCards.legnth > 1 ) {
			// if there are multiple sets
			for(i=0;i<destroSetCards.length;i++){
				factionListEmbed(message,destroSetCards[i],cmd,i+1)
			}
		} else {
			factionListEmbed(message,destroSetCards[0],cmd)
		}
	}
	if ( neutralCards.length > 0 ) {
		//message.channel.send('We have '+ neutralCards.length +' neutral cards');
		var neutralSetCards = []
		for(i=0;i<neutralCards.length;i++){
			if ( neutralSetCards[neutralCards[i].set-1] == undefined ){
				neutralSetCards.push([neutralCards[i]])
			} else {
				neutralSetCards[neutralCards[i].set-1].push(neutralCards[i])
			}
		}
		if ( neutralSetCards.legnth > 1 ) {
			// if there are multiple sets
			for(i=0;i<neutralSetCards.length;i++){
				factionListEmbed(message,neutralSetCards[i],cmd,i+1)
			}
		} else {
			factionListEmbed(message,neutralSetCards[0],cmd)
		}
	}
}

function findRule(message, findArray, cmd, rule){
	var activeRule
	if (rule == 'undefined' || rule == null){ activeRule = rules[findArray[0]] }
	else { activeRule = rule[findArray[0]] }
	
	if ( typeof activeRule == "object" && findArray.length > 1 ) {
		findArray.shift()
		findRule(message,findArray,cmd,activeRule)
	} else {
		if ( activeRule == 'undefined' || activeRule == null ) {
			message.channel.send("Invalid Rule Entry")
		} else {
			if (typeof activeRule == "object") {
				message.channel.send("**Rule "+ cmd +":**  "+activeRule[0])
			} else {
				console.log(activeRule.length)
				message.channel.send("**Rule "+ cmd +":**  "+activeRule)
			}
		}
	}
}

bot.on("ready", async () => {
  bot.user.setUsername("TheBlackLibrary");
  console.log(`The Black Library is now online and running!`);
  bot.user.setActivity("Warhammer Champions");
});

bot.on("message", async message => {
	if (message.author.bot) return;
	//if (message.channel.type === "dm" ) return;

	//create array of commands for parsing
	var cmdRegex = /\[\[(.*?)\]\]/g;
	var cmdArray = message.content.match(cmdRegex);

	if(cmdArray != null){
		//duplicate command detections
		if (cmdArray.length > 1){
			var noDups = cmdArray.filter(function(elem, pos) {
				return cmdArray.indexOf(elem) == pos;
			})
			cmdArray = noDups;
		}
		
		//loop through commands found and execute Message Functions
		for(i=0;i < cmdArray.length;i++){
			var cmd = cmdArray[i].substring(2,cmdArray[i].length-2)
			//this is for you Arti!!
			if (cmd === 'doot' || cmd === "dootboy" || cmd === "dootboi") { cmd = "knight-heraldor"}
			if (cmd === '+doot' || cmd === "+dootboy" || cmd === "+dootboi") { cmd = "+knight-heraldor"} 
			console.log(cmd)
			if (cmd.toLowerCase() === "help") {
				message.author.send("__**List of Possible Commands**__\n\n__Single Cards__\n\n[[searchPhrase]] : this command will search the API for the phrase you entered and send out a formatted embed based on the first matched card, if no match is found and invalid command message will be sent.\n[[+searchPhrase]] : this is the same as above except it returns the card image instead of formatted text, also returns invalid command message on no match.\n\n__List of Cards__\n\nA command starts off with list_ and then can have up to 4 (so far) tags put in after it.\nHere is an example command [[list_order_unit_common]], this will yeid a private message to you with the list cards that match your chosen tags.\nCurrent tags allowed are for Alliance, Category (card type), Rarity, and Tags(ie storcast, risen, orruck). For a list of accepted tags use [[list_tags]].\n\n__Rule Command__ ***new***\n\nThe rules command is here to save you time on copying and pasting rules, as long as you know the rules code the bot can post it for you! An example command would be [[rule_2.7.3.2]] (\"rules\" is also accepted). You can also get the rules for keywords and game terms by simply putting the term after \"rule\", for example to see the rule for the Dormant Keyword you would put [[rule_dormant]].")
			} else if(cmd.substring(0,5).toLowerCase() === "list_"){
				if (cmd === "list_tags") {
					message.author.send("__**List Commands Tags**__\n\nexclusive(exclusives)\nrare(rares)\nuncommon(uncommons)\ncommon(commons)\norder\nchaos\ndeath\ndestruction\nany(unaligned)\nchampion(champions)\nblessing(blessings)\nunit(units)\nspell(spells)\nability(abilities)\nstormcast\norruk\nbeast\ndaemon\nunique\ngrot\nrisen\nstacking\naelf\nvampire\nmordant\nspirit\nvehicle\nogor\nset # (ie 1, 01, 2, or 02, putting \"wave\" infront of the # is also accepted)\nall")
				} else {
					//Detect if a cmd is asking for a list
					var queryCmds = []
					var cmdLists = cmd.split('_');
					var cmdListsClean = []
					//loop to ensure wanted list commands
					for(i=0;i<cmdLists.length;i++){
						switch(cmdLists[i].toLocaleLowerCase()){
							case 'exclusive':
							case 'exclusives':
							case 'rares':
							case 'rare':
							case 'uncommon':
							case 'uncommons':
							case 'common':
							case 'commons':
							case 'order':
							case 'chaos':
							case 'death':
							case 'destruction':
							case 'any':
							case 'unaligned':
							case 'champion':
							case 'champions':
							case 'blessing':
							case 'blessings':
							case 'unit':
							case 'units':
							case 'spell':
							case 'spells':
							case 'ability':
							case 'abilities':
							case "stormcast":
							case "orruk":
							case "beast":
							case "daemon":
							case "unique":
							case "grot":
							case "risen":
							case "stacking":
							case "aelf":
							case "vampire":
							case "mordant":
							case "spirit":
							case "vehicle":
							case "ogor":
							case "1":
							case "01":
							case "2":
							case "02":
							case "wave1":
							case "wave01":
							case "wave2":
							case "wave02":
							case 'all':
								cmdListsClean.push(cmdLists[i])
								break;
						}
					}
					cmdLists = cmdListsClean

					for(i=0;i<cmdLists.length;i++){
						switch(cmdLists[i].toLocaleLowerCase()){
							case 'exclusive':
							case 'exclusives':
								queryCmds.push({ match: { rarity: "Exclusive" } })
								break;
							case 'rare':
							case 'rares':
								queryCmds.push({ match: { rarity: "Rare" } })
								break;
							case 'uncommon':
							case 'uncommons':
								queryCmds.push({ match: { rarity: "Uncommon" } })
								break;
							case 'common':
							case 'commons':
								queryCmds.push({ match: { rarity: "Common" } })
								break;
							case 'order':
								queryCmds.push({ match: { alliance: "Order" } })
								break;
							case 'chaos':
								queryCmds.push({ match: { alliance: "Chaos" } })
								break;
							case 'death':
								queryCmds.push({ match: { alliance: "Death" } })
								break;
							case 'destruction':
								queryCmds.push({ match: { alliance: "Destruction" } })
								break;
							case 'any':
							case 'unaligned':
								queryCmds.push({ match: { alliance: "Any" } })
								break;
							case 'champion':
							case 'champions':
								queryCmds.push({ "nested": { "path": "category", "query": { "bool": { "filter": [ { "term": {"category.en": "Champion"} } ] } } } })
								break;	
							case 'blessing':
							case 'blessings':
								queryCmds.push({ "nested": { "path": "category", "query": { "bool": { "filter": [ { "term": {"category.en": "Blessing"} } ] } } } })
								break;
							case 'unit':
							case 'units':
								queryCmds.push({ "nested": { "path": "category", "query": { "bool": { "filter": [ { "term": {"category.en": "Unit"} } ] } } } })
								break;
							case 'spell':
							case 'spells':
								queryCmds.push({ "nested": { "path": "category", "query": { "bool": { "filter": [ { "term": {"category.en": "Spell"} } ] } } } })
								break;
							case 'ability':
							case 'abilities':
								queryCmds.push({ "nested": { "path": "category", "query": { "bool": { "filter": [ { "term": {"category.en": "Ability"} } ] } } } })
								break;
							case "stormcast":
								queryCmds.push({ match: { tags: "Stormcast" } })
								break;
							case "orruk":
								queryCmds.push({ match: { tags: "Orruk" } })
								break;
							case "beast":
								queryCmds.push({ match: { tags: "Beast" } })
								break;
							case "daemon":
								queryCmds.push({ match: { tags: "Daemon" } })
								break;
							case "unique":
								queryCmds.push({ match: { tags: "Unique" } })
								break;
							case "grot":
								queryCmds.push({ match: { tags: "Grot" } })
								break;
							case "risen":
								queryCmds.push({ match: { tags: "Risen" } })
								break;
							case "stacking":
								queryCmds.push({ match: { tags: "Stacking" } })
								break;
							case "aelf":
								queryCmds.push({ match: { tags: "Aelf" } })
								break;
							case "vampire":
								queryCmds.push({ match: { tags: "Vampire" } })
								break;
							case "mordant":
								queryCmds.push({ match: { tags: "Mordant" } })
								break;
							case "spirit":
								queryCmds.push({ match: { tags: "Spirit" } })
								break;
							case "vehicle":
								queryCmds.push({ match: { tags: "Vehicle" } })
								break;
							case "ogor":
								queryCmds.push({ match: { tags: "Ogor" } })
								break;
							case "1":
							case "01":
							case "wave1":
							case "wave01":
								queryCmds.push({ match: { set: "1" } })
								break;
							case "2":
							case "02":
							case "wave2":
							case "wave02":
								queryCmds.push({ match: { set: "2" } })
								break;
						}
					}
					
					if (cmdLists.length === 0) {
						message.channel.send("Invalid List Command");
					} else {
						const query = {
							size: 406, //Query size should be a number >= total number of printed cards
							//can add in set filter at a later date 
							query: { bool: { must: queryCmds } },
							_source: { include: ["name","alliance","category","rarity","set","wave"] },
							sort: [ {"name.keyword": "asc"} ]
						};
						const req = fetch("https://carddatabase.warhammerchampions.com/warhammer-cards/_search", {
							method: "POST",
							headers: {"Content-Type": "application/json"},
							body: JSON.stringify(query)
						});
						// Display/Use the result
						req.then((resp) => resp.json()).then((data) => { listOutput(message, data.hits.hits,cmdLists) })
					}
				}
			} else if(cmd.substring(0,5).toLowerCase() === "rule_" || cmd.substring(0,6).toLowerCase() === "rules_"){
				if ( cmd.substring(0,6).toLowerCase() === "rules_" ) { var rule = cmd.substring(6) }
				else { var rule = cmd.substring(5) }
				if ( /^[a-zA-Z ]+$/.test(rule) ) {
					switch(rule.toLowerCase()) {
						case 'clunky':
							rule = "6.1.2.Clunky";
							break;
						case "deploy":
							rule = "6.1.2.Deploy";
							break;
						case "discard":
							rule = "6.1.2.Discard";
							break;
						case "disengaged":
							rule = "6.1.2.Disengaged";
							break;
						case "dormant":
							rule = "6.1.2.Dormant";
							break;
						case "draw":
							rule = "6.1.2.Draw";
							break;
						case "engaged":
							rule = "6.1.2.Engaged";
							break;
						case "exhaust":
							rule = "6.1.2.Exhaust";
							break;
						case "last stand":
							rule = "6.1.2.Last Stand";
							break;
						case "play":
							rule = "6.1.2.Play";
							break;
						case "rend":
							rule = "6.1.2.Rend";
							break;
						case "restart":
							rule = "6.1.2.Restart";
							break;
						case "rotate":
							rule = "6.1.2.Rotate";
							break;
						case "remove":
							rule = "6.1.2.Remove";
							break;
						case "support":
							rule = "6.1.2.Support";
							break;
						case "allied":
							rule = "6.1.2.Allied";
							break;
						case "after playing a card":
							rule = "6.1.2.After Playing a Card";
							break;
						case "control":
							rule = "6.1.2.Control";
							break;
						case "enemy":
							rule = "6.1.2.Enemy";
							break;
						case "move":
							rule = "6.1.2.Move";
							break;
						case "leaving play":
							rule = "6.1.2.Leaving Play";
							break;
						case "normal restrictions":
							rule = "6.1.2.Normal Restrictions";
							break;
						case "replace":
							rule = "6.1.2.Replace";
							break;
						case "since your last turn":
							rule = "6.1.2.Since Your Last Turn";
							break;
						case "swap":
							rule = "6.1.2.Swap";
							break;
						case "trait":
							rule = "6.1.2.Trait";
							break;
						case "x":
							rule = "6.1.2.X";
							break;
					}
				}
				//console.log(rule)
				var ruleArray = rule.split('.')
				var arrayLast = ruleArray[ruleArray.length-1]
				
				if( arrayLast.match(/[^\d]+|\d+/g).length > 1 ){
					arrayLast = arrayLast.match(/[^\d]+|\d+/g)
					ruleArray.pop()
					for(i=0;i<arrayLast.length;i++){ ruleArray.push(arrayLast[i]) }
				}

				findRule(message,ruleArray,rule)
			} else if (cmd.substring(0,1).toLowerCase() === "+"){
				const query = {
					size: 1, query: {match_phrase: {name: cmd.substring(1)}}
				}
				const req = fetch("https://carddatabase.warhammerchampions.com/warhammer-cards/_search", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify(query)
				})
				
				// Display the result
				req.then((resp) => resp.json()).then((data) => {
					if (data.hits.total === 0){ message.channel.send("Invalid Card Name"); }
					else {
						const card = data.hits.hits[0]._source
						// Note: the sku array is guaranteed to have at least 1 default sku for each language
						const defaultSku = card.skus.filter((sku) => sku.default && sku.lang === "en")[0]
						const src = "https://assets.warhammerchampions.com/card-database/cards/" + defaultSku.id + ".jpg"

						message.channel.send({ embed:{ "image":{ "url": src } } });
					}
				})
			} else {
				//console.log('name search '+i+' fired');
				const query = {
					size: 1, query: {match_phrase: {name: cmd}}
				};
				const req = fetch("https://carddatabase.warhammerchampions.com/warhammer-cards/_search", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify(query)
				});
				// Display/Use the result
				req.then((resp) => resp.json()).then((data) => {
					if (data.hits.total === 0){ message.channel.send("Invalid Card Name"); }
					else { nameOutput(message, data.hits.hits[0]._source); }
				})
			}
		}
	} else return;
});

bot.on("disconnect",function(){
	console.log(`The Black Library has gone offline!`);
	bot.login(tokenfile.token);
})

bot.login(tokenfile.token);