export const VERSION='reconstruction-0.1.0';
export const COLORS={red:'#f65b59',blue:'#51a9f5',yellow:'#f5d466',green:'#66c9a1',pink:'#ee8fbd'};
export const TEAMS=[{id:'gokai',name:'Gokaiger',title:'Kaizoku Sentai',year:2011},{id:'shinken',name:'Shinkenger',title:'Samurai Sentai',year:2009},{id:'deka',name:'Dekaranger',title:'Tokusou Sentai',year:2004},{id:'magi',name:'Magiranger',title:'Mahou Sentai',year:2005}];
const prefixes={gokai:'Gokai',shinken:'Shinken',deka:'Deka',magi:'Magi'};
export const CARDS=TEAMS.flatMap((team,ti)=>Object.keys(COLORS).flatMap((color,ci)=>[0,1].map(rare=>({id:`${team.id}-${color}-${rare}`,team:team.id,color,name:`${prefixes[team.id]} ${color[0].toUpperCase()+color.slice(1)}`,rarity:rare?'LEGEND':'HERO',cost:rare?6:4,hp:700+ti*50+rare*200,attack:95+ci*7+rare*40,defense:18+ti*3,speed:14+ci,skill:ci===2?'Restoring light':ci===3?'Soul spark':'Sentai strike',description:ci===2?'Restore Deck HP.':ci===3?'Strike and restore Soul.':'A powerful strike against your target.',evidence:'reconstructed'}))));
export const cardById=id=>CARDS.find(c=>c.id===id);
export const teamName=id=>TEAMS.find(t=>t.id===id)?.name||'Choose your Sentai';
export const STAGES=[
 {id:'arrival',chapter:'01',name:'First deployment',subtitle:'Build a team. Hold the line.',kind:'story',enemy:'Vanguard',enemyHp:3100,attack:110,reward:120,gems:20,time:1200,unlockedBy:null,arena:false},
 {id:'crossfire',chapter:'02',name:'Crossfire',subtitle:'Chain across colors and teams.',kind:'story',enemy:'Iron Sentinel',enemyHp:4700,attack:140,reward:180,gems:25,time:1400,unlockedBy:'arrival',arena:false},
 {id:'giant',chapter:'03',name:'Colossal awakening',subtitle:'A second form awaits.',kind:'story',enemy:'Dread Colossus',enemyHp:3300,giantHp:4400,attack:145,reward:260,gems:35,time:1800,unlockedBy:'crossfire',arena:false},
 {id:'trial',chapter:'EX',name:'Trial of the four',subtitle:'Three waves. One surviving deck.',kind:'event',enemy:'Trial Guardian',enemyHp:2700,waves:3,attack:115,reward:220,gems:25,time:1800,unlockedBy:null,arena:false},
 {id:'arena',chapter:'VS',name:'Hero Arena',subtitle:'Command a squad in turn-based combat.',kind:'arena',enemy:'Archive challengers',enemyHp:2400,attack:100,reward:150,gems:15,time:9999,unlockedBy:null,arena:true}
];
export const stageById=id=>STAGES.find(s=>s.id===id);
export const RULES={id:VERSION,evidence:'reconstructed',source:'ADAPT-001',tickMs:100,initialSoul:40,maxSoul:60,maxGauge:100,chainWindow:30,changeActions:12,deckHp:4400,handSize:6};
export const DIAS=[{id:'resolve',name:'Unbroken resolve',description:'+12% starting Deck HP',cost:200},{id:'spirit',name:'Gathering spirit',description:'+8 starting Soul',cost:200},{id:'unity',name:'United front',description:'+10% fighter attack',cost:250}];
