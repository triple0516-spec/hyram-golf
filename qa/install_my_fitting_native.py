"""Generate a native Flutter MY FITTING screen and safely link it from verified RC24 HomeScreen."""
from pathlib import Path
p=Path("lib/screens/hyram_my_fitting_screen.dart")
p.write_text(r'''// Generated MY FITTING display strings intentionally concatenate optional values.
// ignore_for_file: prefer_interpolation_to_compose_strings
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

class HyramMyFittingScreen extends StatefulWidget {
  const HyramMyFittingScreen({super.key});
  @override State<HyramMyFittingScreen> createState()=>_FittingState();
}
class _FittingState extends State<HyramMyFittingScreen>{
  static const keyName='hyram_native_fitting_v1';
  static const brands=<String>['타이틀리스트','테일러메이드','캘러웨이','핑','PXG','미즈노','스릭슨','젝시오','브리지스톤','코브라','혼마','클리브랜드','야마하','PRGR','마제스티','포틴','오노프','요넥스','미우라','에폰','로마로','투어엣지','윌슨','오디세이','스카티카메론'];
  static const goals=<String,List<String>>{'방향성':['핑','캘러웨이','타이틀리스트'],'비거리':['테일러메이드','코브라','캘러웨이'],'타구감':['미즈노','미우라','스릭슨'],'경량':['젝시오','마제스티','오노프'],'커스텀':['PXG','에폰','로마로']};
  static const phases=<String>['구매 전','구매 후','재점검'];
  static const cares=<String>['중고 상태 점검','중고 매입 상담','보상판매 상담','구매 후 재점검'];
  final fields=List.generate(14,(_)=>TextEditingController());
  String goal='방향성',phase='구매 전',brand='타이틀리스트',care='중고 상태 점검';
  List<Map<String,dynamic>> performance=[],custom=[],maintenance=[];
  bool loaded=false;
  @override void initState(){super.initState();load();}
  @override void dispose(){for(final f in fields){f.dispose();}super.dispose();}
  void info(String s){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text(s)));}
  List<Map<String,dynamic>> mapList(dynamic value){
    if(value is! List)return [];
    return value.whereType<Map>().take(300).map((x)=>x.map((k,v)=>MapEntry(k.toString(),v))).toList();
  }
  Future<void> load() async {
    try{
      final pref=await SharedPreferences.getInstance();
      final saved=pref.getString(keyName);
      if(saved!=null){
        final x=jsonDecode(saved);
        if(x is Map){performance=mapList(x['performance']);custom=mapList(x['custom']);maintenance=mapList(x['maintenance']);}
      }
    }catch(_){/* Malformed local cache: use empty local data. */}
    if(mounted)setState(()=>loaded=true);
  }
  Future<void> save() async {
    try{
      final p=await SharedPreferences.getInstance();
      await p.setString(keyName,jsonEncode({'performance':performance,'custom':custom,'maintenance':maintenance}));
      info('이 기기에 저장했어요. 웹과 자동 동기화되지 않아요.');
    }catch(_){info('기기에 저장하지 못했습니다.');}
  }
  Widget input(int n,String title,{bool number=false,int lines=1})=>Padding(padding:const EdgeInsets.only(bottom:10),
    child:TextField(controller:fields[n],maxLines:lines,maxLength:lines>1?240:90,
      keyboardType:number?const TextInputType.numberWithOptions(decimal:true,signed:true):TextInputType.text,
      decoration:InputDecoration(labelText:title,border:const OutlineInputBorder(),isDense:true)));
  Widget heading(String name,String text)=>Padding(padding:const EdgeInsets.only(bottom:15),
    child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
      Text(name,style:const TextStyle(fontSize:22,fontWeight:FontWeight.w700)),
      const SizedBox(height:5),Text(text,style:const TextStyle(fontSize:12,height:1.5))
    ]));
  Widget dropdown(String selected,List<String> options,ValueChanged<String?> change,String title)=>DropdownButtonFormField<String>(
    initialValue:selected,decoration:InputDecoration(labelText:title,border:const OutlineInputBorder()),
    items:options.map((s)=>DropdownMenuItem(value:s,child:Text(s))).toList(),onChanged:change);
  Widget item(String title,String sub)=>Card(child:ListTile(title:Text(title),subtitle:Text(sub)));
  Widget matchTab()=>ListView(padding:const EdgeInsets.all(16),children:[
    heading('HYRAM MATCH','25개 브랜드의 콘셉트를 참고해 목표에 따른 후보를 찾고, 실제 적합성은 피팅으로 확인해요.'),
    dropdown(goal,goals.keys.toList(),(v)=>setState(()=>goal=v??goal),'플레이 목표'),
    const SizedBox(height:15),item('브랜드 탐색 후보 3개',(goals[goal]??[]).join(' / ')),
    const SizedBox(height:12),const Text('25 BRAND CURATION',style:TextStyle(fontWeight:FontWeight.bold)),
    Wrap(spacing:5,children:brands.map((b)=>Chip(label:Text(b,style:const TextStyle(fontSize:11)))).toList()),
    const Text('제조사 공식 평가나 모델별 성능·재고 보증이 아닙니다.',style:TextStyle(fontSize:11)),
  ]);
  void addMeasurement(){
    final nums=[1,2,3,4].map((n)=>double.tryParse(fields[n].text.trim())).toList();
    if(fields[0].text.trim().isEmpty||nums.any((x)=>x==null)){info('클럽명과 네 가지 측정값을 입력해 주세요.');return;}
    if(nums[0]!< -10||nums[0]!>75||nums[1]!<0||nums[1]!>15000||nums[2]!< -90||nums[2]!>90||nums[3]!<0||nums[3]!>450){info('측정값 범위를 확인해 주세요.');return;}
    setState(()=>performance.add({'date':DateTime.now().toIso8601String().substring(0,10),
      'phase':phase,'club':fields[0].text.trim(),'launch':nums[0],'spin':nums[1],'direction':nums[2],'carry':nums[3]}));
    for(int n=0;n<=4;n++){fields[n].clear();}
    save();
  }
  String delta(String metric,String unit){
    final a=performance.where((m)=>m['phase']=='구매 전').toList();
    final b=performance.where((m)=>m['phase']!='구매 전').toList();
    if(a.isEmpty||b.isEmpty)return '비교 기록 부족';
    final n=(b.last[metric] as num).toDouble()-(a.last[metric] as num).toDouble();
    return (n>=0?'+':'')+n.toStringAsFixed(1)+' '+unit;
  }
  Widget performanceTab()=>ListView(padding:const EdgeInsets.all(16),children:[
    heading('HYRAM PERFORMANCE','측정 장비에서 직접 확인한 발사각·백스핀·방향·캐리 데이터를 입력해요.'),
    dropdown(phase,phases,(v)=>setState(()=>phase=v??phase),'측정 단계'),
    const SizedBox(height:12),input(0,'클럽명'),
    input(1,'발사각 (°)',number:true),input(2,'백스핀 (rpm)',number:true),
    input(3,'출발 방향 (우측 +, °)',number:true),input(4,'캐리 (m)',number:true),
    FilledButton(onPressed:addMeasurement,child:const Text('이 기기에 기록 저장')),
    const SizedBox(height:17),item('최근 구매 전후 변화','발사각 '+delta('launch','°')+'\n백스핀 '+delta('spin','rpm')+'\n방향 '+delta('direction','°')+'\n캐리 '+delta('carry','m')),
    const Text('동일한 측정 장비와 조건에서 비교해야 하며 수치 변화만으로 실력 향상을 단정하지 않습니다.',style:TextStyle(fontSize:11)),
    ...performance.reversed.take(12).map((m)=>item((m['date']??'').toString()+' · '+(m['phase']??'').toString()+' · '+(m['club']??'').toString(),
      '발사각 '+(m['launch']??'').toString()+'° / 스핀 '+(m['spin']??'').toString()+'rpm / 방향 '+(m['direction']??'').toString()+'° / 캐리 '+(m['carry']??'').toString()+'m')),
  ]);
  void addCustom(){
    if(fields[5].text.trim().isEmpty||fields[6].text.trim().isEmpty){info('헤드와 샤프트를 입력해 주세요.');return;}
    setState(()=>custom.add({'brand':brand,'head':fields[5].text.trim(),'shaft':fields[6].text.trim(),
      'flex':fields[7].text.trim(),'loft':fields[8].text.trim(),'lie':fields[9].text.trim(),'grip':fields[10].text.trim()}));
    for(int n=5;n<=10;n++){fields[n].clear();}
    save();
  }
  String buildText()=>custom.reversed.take(2).map((b)=>(b['brand']??'').toString()+' '+(b['head']??'').toString()+
     ' / 샤프트 '+(b['shaft']??'').toString()+' '+(b['flex']??'').toString()+
     ' / 로프트 '+(b['loft']??'').toString()+' / 라이 '+(b['lie']??'').toString()+
     ' / 그립 '+(b['grip']??'').toString()).join('\n');
  Widget customTab()=>ListView(padding:const EdgeInsets.all(16),children:[
    heading('HYRAM CUSTOM LAB','헤드·샤프트·로프트·라이각·그립을 구성해 제작 가능 여부와 견적을 상담해요.'),
    dropdown(brand,brands,(v)=>setState(()=>brand=v??brand),'브랜드'),
    const SizedBox(height:12),input(5,'헤드 / 모델'),input(6,'샤프트'),input(7,'Flex'),
    input(8,'로프트 (°)',number:true),input(9,'라이각 (°)',number:true),input(10,'그립'),
    FilledButton(onPressed:addCustom,child:const Text('구성 후보 저장')),
    const SizedBox(height:13),...custom.reversed.take(12).map((b)=>item((b['brand']??'').toString()+' '+(b['head']??'').toString(),
      (b['shaft']??'').toString()+' / '+(b['flex']??'').toString()+' / 로프트 '+(b['loft']??'').toString()+' / 라이 '+(b['lie']??'').toString()+' / 그립 '+(b['grip']??'').toString())),
    OutlinedButton(onPressed:()=>copy('[HYRAM CUSTOM LAB 견적 문의]\n'+buildText()+'\n실제 제작 가능 여부 및 금액 확인 부탁드립니다.'),child:const Text('최근 구성 최대 2개 견적 문의 복사')),
  ]);
  void addCare(){
    if(fields[11].text.trim().isEmpty){info('클럽 모델을 입력해 주세요.');return;}
    setState(()=>maintenance.add({'kind':care,'club':fields[11].text.trim(),
      'when':fields[12].text.trim(),'memo':fields[13].text.trim()}));
    for(int n=11;n<=13;n++){fields[n].clear();}
    save();
  }
  Widget careTab()=>ListView(padding:const EdgeInsets.all(16),children:[
    heading('HYRAM TRADE & CARE','중고 상태, 매입 상담, 보상판매, 구매 후 재점검 일정을 기록합니다. 자동 알림이나 감정 결과는 제공하지 않습니다.'),
    dropdown(care,cares,(v)=>setState(()=>care=v??care),'관리 유형'),
    const SizedBox(height:12),input(11,'브랜드 · 모델'),input(12,'희망일 YYYY-MM-DD'),
    input(13,'상태 · 요청 메모',lines:2),
    FilledButton(onPressed:addCare,child:const Text('관리 기록 저장')),
    const SizedBox(height:12),...maintenance.reversed.take(12).map((m)=>item((m['kind']??'').toString()+' · '+(m['club']??'').toString(),
       '희망일: '+(m['when']??'').toString()+' / '+(m['memo']??'').toString())),
    OutlinedButton(onPressed:()=>copy('[HYRAM TRADE & CARE 상담]\n'+maintenance.reversed.take(3).map((m)=>m.toString()).join('\n')),
      child:const Text('관리 기록 상담 내용 복사')),
  ]);
  Future<void> copy(String content) async {await Clipboard.setData(ClipboardData(text:content));info('복사했어요. 상담방에서 붙여넣어 주세요.');}
  Future<void> checkout() async {
    final uri=Uri.parse('https://www.hyramgolf.kr/checkout.html');
    if(!await launchUrl(uri,mode:LaunchMode.externalApplication)){info('주문 안내를 열지 못했습니다.');}
  }
  @override Widget build(BuildContext context)=>DefaultTabController(length:4,child:Scaffold(
    appBar:AppBar(title:const Text('HYRAM · MY FITTING'),bottom:const TabBar(isScrollable:true,tabs:[
      Tab(text:'MATCH'),Tab(text:'PERFORMANCE'),Tab(text:'CUSTOM LAB'),Tab(text:'TRADE & CARE')
    ])),
    body:!loaded?const Center(child:CircularProgressIndicator()):Column(children:[
      const Padding(padding:EdgeInsets.all(10),child:Text('베타: 이 기기에만 저장 · 브라우저/계정 연동 없음 · 온라인 결제 별도 승인 필요',style:TextStyle(fontSize:11))),
      Expanded(child:TabBarView(children:[matchTab(),performanceTab(),customTab(),careTab()])),
    ]),
    bottomNavigationBar:SafeArea(child:Padding(padding:const EdgeInsets.all(10),
      child:OutlinedButton.icon(onPressed:checkout,icon:const Icon(Icons.payment),label:const Text('주문·결제 안내 (외부 사이트)')))),
  ));
}
''',encoding="utf-8")

home=Path("lib/screens/home_screen.dart")
source=home.read_text(encoding="utf-8")
anchor="import 'pro/pro_license_screen.dart';"
placement="const SizedBox(height:12),LuxuryCard(onTap:()=>push(const AiScreen())"
if source.count(anchor)!=1 or source.count(placement)!=1:
    raise SystemExit("BLOCKED: expected HomeScreen anchors changed, refusing patch")
source=source.replace(anchor,anchor+"\nimport 'hyram_my_fitting_screen.dart';")
card="""const SizedBox(height:12),
    LuxuryCard(onTap:()=>push(const HyramMyFittingScreen()),child:const Row(children:[
      Icon(Icons.insights_outlined,color:HyramColors.gold),SizedBox(width:12),
      Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
        Text('HYRAM · MY FITTING',style:TextStyle(fontWeight:FontWeight.w800)),
        Text('구매 전후 측정 · 맞춤 구성 · 보상판매',style:TextStyle(fontSize:11))
      ])),Icon(Icons.arrow_forward_ios,size:14)
    ])),
    """
source=source.replace(placement,card+placement)
home.write_text(source,encoding="utf-8")
print("PASS - generated native fitting screen and wired HomeScreen entry")
