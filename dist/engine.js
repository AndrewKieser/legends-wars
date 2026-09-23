import {cardById,stageById,RULES,VERSION} from './content.js';
export const clone=x=>JSON.parse(JSON.stringify(x));
export function hash(x){const s=typeof x==='string'?x:JSON.stringify(x);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
export function random(s,max){let x=s.rng>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng%max}
function log(s,type,text,data={}){s.events.push({tick:s.tick,type,text,...data});}
function draw(s){if(!s.pile.length){s.pile=s.discard.splice(0);shuffle(s,s.pile)}if(s.pile.length)s.hand.push(s.pile.pop())}
function shuffle(s,a){for(let i=a.length-1;i>0;i--){const j=random(s,i+1);[a[i],a[j]]=[a[j],a[i]]}}
export function createBattle(config){
 const stage=stageById(config.stage);if(!stage)throw Error('Unknown stage');if(config.deck.length!==20||new Set(config.deck).size!==20||config.deck.some(id=>!cardById(id)))throw Error('A deck needs 20 different cards');
 const s={version:VERSION,config:clone(config),tick:0,rng:config.seed>>>0||1,pile:[...config.deck],discard:[],hand:[],fighters:[],enemy:{name:stage.enemy,hp:stage.enemyHp,maxHp:stage.enemyHp,next:28,attack:stage.attack},hp:RULES.deckHp,maxHp:RULES.deckHp,soul:RULES.initialSoul,v:0,change:0,main:null,chain:null,combo:0,bestCombo:0,wave:1,phase:'normal',result:null,events:[],commands:[],damage:0};
 if(config.dia==='resolve')s.hp=s.maxHp=Math.floor(s.maxHp*1.12);if(config.dia==='spirit')s.soul+=8;
 shuffle(s,s.pile);for(let i=0;i<6;i++)draw(s);log(s,'start',stage.name);return s;
}
function stats(s,id){const c=cardById(id),level=s.config.levels[id]||1,mul=100+(level-1)*7;return {...c,attack:Math.floor(c.attack*mul/100*(s.config.dia==='unity'?1.1:1)),hp:Math.floor(c.hp*mul/100)}}
function hit(s,amount,label){const crit=random(s,100)<12,damage=Math.max(1,Math.floor(amount*(crit?1.5:1)));s.enemy.hp=Math.max(0,s.enemy.hp-damage);s.damage+=damage;s.v=Math.min(100,s.v+6);s.change=Math.min(12,s.change+1);log(s,crit?'critical':'hit',`${label} · ${damage}${crit?' CRITICAL':''}`,{damage});resolveEnemy(s);}
function resolveEnemy(s){if(s.enemy.hp>0||s.result)return;const st=stageById(s.config.stage);if(st.giantHp&&s.phase==='normal'){s.phase='giant';s.enemy.hp=s.enemy.maxHp=st.giantHp;s.enemy.attack+=35;log(s,'phase','GIANT PHASE · The enemy has grown!')}else if(s.wave<(st.waves||1)){s.wave++;s.enemy.hp=s.enemy.maxHp=st.enemyHp+400*(s.wave-1);s.soul=Math.min(60,s.soul+10);log(s,'wave',`Wave ${s.wave} · Reinforcements incoming`)}else{s.result='victory';log(s,'victory','Mission complete')}}
export function command(s,cmd,record=true){
 if(s.result)return {ok:false,error:'This battle has ended.'};
 let c;
 if(cmd.type==='play'||cmd.type==='skill'){
  if(!Number.isInteger(cmd.slot)||cmd.slot<0||cmd.slot>=s.hand.length)return{ok:false,error:'Choose a card in your hand.'};
  c=stats(s,s.hand[cmd.slot]);if(s.soul<c.cost)return{ok:false,error:'Not enough Soul.'};
  if(cmd.type==='skill'&&s.v<40)return{ok:false,error:'A Super Skill needs 40 V.'};
  if(cmd.type==='play'&&s.chain&&s.tick<=s.chain.until&&c.team!==s.chain.team&&c.color!==s.chain.color)return{ok:false,error:'Chain by the same color or Sentai, or wait for the chain to end.'};
  if(cmd.type==='play'&&c.team===s.main&&s.fighters.some(f=>f.card.color===c.color&&f.hp>0))return{ok:false,error:'That team color is already deployed. Use its Super Skill instead.'};
 }else if(cmd.type==='change'){if(s.change<12)return{ok:false,error:'Sentai Change needs 12 actions.'}}
 else if(cmd.type==='finisher'){if(s.v<100||!s.fighters.length)return{ok:false,error:'Deploy your team and fill V to 100.'}}
 else if(cmd.type!=='retreat')return{ok:false,error:'Unknown battle command.'};
 if(record)s.commands.push({tick:s.tick,...clone(cmd)});
 if(cmd.type==='retreat'){s.result='retreat';log(s,'retreat','Mission withdrawn');return{ok:true}}
 if(cmd.type==='change'){s.main=null;s.fighters=[];s.change=0;s.chain=null;s.combo=0;s.soul=Math.min(60,s.soul+22);s.hp=Math.min(s.maxHp,s.hp+500);log(s,'change','SENTAI CHANGE · Deploy a new lead');return{ok:true}}
 if(cmd.type==='finisher'){s.v=0;for(const f of s.fighters)f.hp=f.maxHp;hit(s,s.fighters.reduce((n,f)=>n+f.card.attack,0)*3,'V-HISSATSU');return{ok:true}}
 s.soul-=c.cost;const id=s.hand.splice(cmd.slot,1)[0];s.discard.push(id);draw(s);
 if(cmd.type==='skill'){s.v-=40;if(c.color==='yellow'){s.hp=Math.min(s.maxHp,s.hp+1000);log(s,'heal',`${c.name} · Restored 1,000 Deck HP`)}else{hit(s,c.attack*4,`${c.name} SUPER`);if(c.color==='green')s.soul=Math.min(60,s.soul+12)}return{ok:true}}
 if(!s.main)s.main=c.team;
 s.combo=s.chain&&s.tick<=s.chain.until?s.combo+1:1;s.bestCombo=Math.max(s.bestCombo,s.combo);s.chain={team:c.team,color:c.color,until:s.tick+30};
 if(c.team===s.main){s.fighters=s.fighters.filter(f=>f.card.color!==c.color);s.fighters.push({card:c,hp:c.hp,maxHp:c.hp,next:s.tick+15});log(s,'deploy',`${c.name} joins the field`);if(s.fighters.length===5){s.v=Math.min(100,s.v+35);s.hp=Math.min(s.maxHp,s.hp+400);log(s,'formation','FULL SENTAI · Roll call!')}}else log(s,'assist',`${c.name} assist`);
 hit(s,Math.floor(c.attack*(1+(s.combo-1)*.12)),c.name);return{ok:true};
}
export function advance(s,ticks=1){for(let n=0;n<ticks&&!s.result;n++){
 s.tick++;if(s.tick%10===0)s.soul=Math.min(60,s.soul+1);if(s.chain&&s.tick>s.chain.until){s.chain=null;s.combo=0}
 for(const f of s.fighters){if(f.hp>0&&s.tick>=f.next){f.next=s.tick+Math.max(9,32-f.card.speed);hit(s,f.card.attack,f.card.name);if(s.result)break}}
 if(s.result)break;
 if(s.tick>=s.enemy.next){s.enemy.next=s.tick+(s.phase==='giant'?22:28);const damage=s.enemy.attack+random(s,35);s.hp=Math.max(0,s.hp-damage);const alive=s.fighters.filter(f=>f.hp>0);if(alive.length){const f=alive[random(s,alive.length)];f.hp=Math.max(0,f.hp-Math.max(1,damage-f.card.defense));log(s,'enemy',`${s.enemy.name} strikes ${f.card.name}`,{damage})}else log(s,'enemy',`${s.enemy.name} strikes the deck`,{damage});if(!s.hp){s.result='defeat';log(s,'defeat','Deck HP depleted')}}
 if(s.tick>=stageById(s.config.stage).time&&!s.result){s.result='defeat';log(s,'defeat','Time expired')}
 }return s}
export function replay(record){if(record.version!==VERSION)throw Error('Replay rules version is unavailable.');const s=createBattle(record.config);let i=0;while(s.tick<=record.endTick){while(i<record.commands.length&&record.commands[i].tick===s.tick){const r=command(s,record.commands[i++]);if(!r.ok)throw Error('Invalid replay command: '+r.error)}if(s.tick===record.endTick||s.result)break;advance(s)}if(i!==record.commands.length)throw Error('Replay contains unreachable commands');return s}
export function replayRecord(s){return{version:VERSION,config:clone(s.config),commands:clone(s.commands),endTick:s.tick,stateHash:hash(s)}}
