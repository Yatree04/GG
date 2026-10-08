/* Sample data for the Ganga Garage prototype (Nandurbar, Maharashtra).
   Names and numbers are illustrative, drawn from the team's field research. */
var TODAY = '2026-10-08';

/* Rate card: each service is a set of bill lines; part lines deduct stock.
   `small` = average number of small parts (nuts, bolts, washers) the service uses. */
var SERV = {
  reg:   {name:'Regular service',    icon:'build',          lines:[['Service labour',300,'labour'],['Engine oil 1 L',380,'part','oil']], small:4},
  brake: {name:'Brake check',        icon:'do_not_step',    lines:[['Brake adjust labour',150,'labour']], small:5},
  oil:   {name:'Oil change',         icon:'oil_barrel',     lines:[['Oil change labour',100,'labour'],['Engine oil 1 L',380,'part','oil']], small:1},
  wash:  {name:'Wash',               icon:'local_car_wash', lines:[['Wash',100,'labour']], small:0},
  punct: {name:'Puncture',           icon:'tire_repair',    lines:[['Puncture repair',80,'labour']], small:0},
  clutch:{name:'Clutch adjust',      icon:'settings',       lines:[['Clutch adjust labour',100,'labour']], small:2},
  chain: {name:'Chain clean & lube', icon:'link',           lines:[['Chain clean & lube',80,'labour']], small:0},
  elec:  {name:'Wiring check',       icon:'electric_bolt',  lines:[['Wiring check labour',150,'labour']], small:3}
};

/* Parts the owner can add mid-service: [id, name, price] */
var PARTS = [
  ['brakeShoe','Brake shoe set',450],['clutchPlate','Clutch plate',1200],['chainSet','Chain sprocket set',1650],
  ['battery','Battery 12V',1900],['sparkPlug','Spark plug',120],['bulb','Headlight bulb',90],
  ['clutchCable','Clutch cable',180],['mirror','Side mirror',220],['airFilter','Air filter',160]
];
var REASONS = ['Worn out','Broken','Leaking','Needed for safety'];
var MECHS = ['Ajay','Jithendra ji'];
var ETAS = ['In 1 hour','In 2 hours','By 5 pm','Tomorrow'];
var MODELS = ['Honda Activa','Hero Splendor','Bajaj Pulsar','Bajaj Platina','TVS Jupiter','Honda Shine','Hero HF Deluxe','Suzuki Access'];

function seedState(){
  var S = {
    view:'track', tab:'waiting', jobId:null, vehId:null, back:[], sheet:null, snack:null,
    threshold:300, search:'', vfilter:'all', sfilter:'all', ob:null,
    min:16*60+12, seq:10, billNo:1043, progress:{}, wagePaid:false,
    customers:{
      sunil:{name:'Sunil Patil',phone:'98220 41157',trust:false},
      rakesh:{name:'Rakesh Valvi',phone:'97665 20318',trust:false},
      himanshu:{name:'Dr. Himanshu',phone:'94049 77215',trust:true},
      imran:{name:'Imran Shaikh',phone:'90110 64482',trust:false},
      ganesh:{name:'Ganesh More',phone:'88301 55290',trust:false},
      pooja:{name:'Pooja Vasave',phone:'99701 23845',trust:false},
      rahul:{name:'Rahul Gavit',phone:'93721 66012',trust:false},
      kiran:{name:'Kiran Patil',phone:'97302 48170',trust:true}
    },
    vehicles:{
      'MH 39 AB 4521':{model:'Honda Activa 6G',cust:'sunil',km:18400,history:[{date:'2026-04-12',what:'Regular service',total:780,mech:'Ajay'}]},
      'MH 39 R 2210':{model:'Bajaj Pulsar 150',cust:'rakesh',km:32100,history:[]},
      'MH 39 K 8812':{model:'Hero Splendor Plus',cust:'himanshu',km:44200,history:[{date:'2026-08-02',what:'Regular service, Wash',total:830,mech:'Ajay'},{date:'2026-05-10',what:'Brake check, Brake shoe set',total:620,mech:'Jithendra ji'}]},
      'MH 39 C 1190':{model:'TVS Jupiter',cust:'imran',km:12900,history:[{date:'2026-03-02',what:'Puncture',total:80,mech:'Ajay'}]},
      'MH 39 Q 7788':{model:'Bajaj Platina',cust:'ganesh',km:27600,history:[{date:'2026-06-20',what:'Puncture',total:80,mech:'Ajay'},{date:'2026-01-15',what:'Regular service',total:760,mech:'Ajay'}]},
      'MH 39 F 6620':{model:'Honda Shine',cust:'pooja',km:9800,history:[{date:'2026-10-08',what:'Regular service',total:710,mech:'Ajay'}]},
      'MH 39 J 1043':{model:'Hero Glamour',cust:'rahul',km:38500,history:[{date:'2026-10-07',what:'Clutch adjust, Clutch plate',total:1300,mech:'Jithendra ji'}]},
      'MH 39 T 5521':{model:'Hero HF Deluxe',cust:'kiran',km:21300,history:[{date:'2026-10-07',what:'Puncture',total:80,mech:'Ajay'},{date:'2026-06-30',what:'Regular service',total:760,mech:'Ajay'}]}
    },
    jobs:[],
    stock:{
      oil:{name:'Engine oil 1 L',qty:9,re:5,cost:290,price:380},
      brakeShoe:{name:'Brake shoe set',qty:3,re:2,cost:320,price:450},
      clutchPlate:{name:'Clutch plate',qty:2,re:1,cost:900,price:1200},
      chainSet:{name:'Chain sprocket set',qty:1,re:1,cost:1250,price:1650},
      battery:{name:'Battery 12V',qty:2,re:1,cost:1500,price:1900},
      sparkPlug:{name:'Spark plug',qty:12,re:6,cost:70,price:120},
      bulb:{name:'Headlight bulb',qty:4,re:5,cost:55,price:90},
      clutchCable:{name:'Clutch cable',qty:6,re:3,cost:120,price:180},
      mirror:{name:'Side mirror',qty:5,re:2,cost:140,price:220},
      airFilter:{name:'Air filter',qty:7,re:3,cost:100,price:160}
    },
    boxes:{
      nuts:{name:'Nuts & bolts (M6)',size:200,level:1.62,cost:400},
      washers:{name:'Washers',size:300,level:0.58,cost:150},
      ties:{name:'Cable ties',size:100,level:0.4,cost:80}
    },
    usage:[
      {t:'11:20 am',what:'Engine oil 1 L',qty:'−1',plate:'MH 39 F 6620'},
      {t:'11:20 am',what:'Nuts & bolts',qty:'−4 pcs',plate:'MH 39 F 6620'},
      {t:'10:05 am',what:'Engine oil 1 L',qty:'+12',plate:'Stock bought'}
    ],
    month:{in:41850,parts:15960,wages:9600,exp:6000},
    ledger:[
      {day:'Today',t:'11:20 am',label:'Bill · MH 39 F 6620 · Regular service',amt:710,mode:'Cash'},
      {day:'Today',t:'10:05 am',label:'Stock bought · Engine oil ×12',amt:-3480,mode:'Cheque'},
      {day:'Yesterday',t:'8:40 pm',label:'Wage · Ajay',amt:-600,mode:'Cash'},
      {day:'Yesterday',t:'6:15 pm',label:'Bill · MH 39 J 1043 · Clutch plate',amt:1300,mode:'UPI'},
      {day:'Yesterday',t:'1:30 pm',label:'Bill · MH 39 T 5521 · Puncture',amt:80,mode:'Cash'}
    ],
    sent:[
      {to:'rakesh',t:'3:05 pm',text:'Estimate for MH 39 R 2210: Regular service, Wash — ₹896.'},
      {to:'himanshu',t:'3:20 pm',text:'Work started on your Hero Splendor Plus by Ajay. Ready by 5 pm.'},
      {to:'imran',t:'3:55 pm',text:'Your TVS Jupiter is ready to collect. Total ₹280. Bill G-1042 attached.'}
    ],
    contacts:[
      {name:'Activa MH39 Sunil',on:true},{name:'Pulsar Rakesh bhau',on:true},{name:'Dr Himanshu bike',on:true},
      {name:'Platina Ganesh',on:true},{name:'Shine Pooja tai',on:true},{name:'Glamour Rahul',on:true},
      {name:'Splendor Vijay (Shahada)',on:true},{name:'Jupiter Imran',on:true},{name:'HF Kiran',on:true},
      {name:'Access Nilesh',on:true},{name:'Taxi union — Sanjay',on:false},{name:'Supplier Dhule — parts',on:false}
    ]
  };
  return S;
}
