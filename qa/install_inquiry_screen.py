from pathlib import Path
p=Path("lib/widgets/hyram_service_inquiry.dart")
p.parent.mkdir(parents=True,exist_ok=True)
p.write_text(r'''import 'package:flutter/material.dart';

/// UI-only inquiry. No server-side booking, payment, or customer-data upload.
class HyramServiceInquiry extends StatefulWidget {
  const HyramServiceInquiry({super.key});
  @override
  State<HyramServiceInquiry> createState() => _HyramServiceInquiryState();
}

class _HyramServiceInquiryState extends State<HyramServiceInquiry> {
  static const services = <String>[
    '골프클럽 구매', '중고클럽 매입·보상판매', '골프 피팅',
    '골프 레슨', '골프장·스크린 부킹',
    '멤버십 SILVER 사전 신청', '멤버십 GOLD 사전 신청',
    '멤버십 PREMIUM 사전 신청', '멤버십 VIP 사전 신청',
  ];
  final formKey = GlobalKey<FormState>();
  final name = TextEditingController();
  final phone = TextEditingController();
  final memo = TextEditingController();
  String? service;
  bool consent = false;
  bool reviewed = false;
  @override
  void dispose() {
    name.dispose(); phone.dispose(); memo.dispose(); super.dispose();
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('HYRAM 예약 · 상담 문의')),
    body: SafeArea(child: Form(
      key: formKey,
      child: ListView(padding: const EdgeInsets.all(20), children: [
        const Text('상담 초안 작성', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('현재 자동 예약·결제·접수 서버는 연결되지 않았습니다. 상담 내용을 확인한 후 카카오톡에서 최종 접수해 주세요.'),
        const SizedBox(height: 20),
        DropdownButtonFormField<String>(
          value: service,
          isExpanded: true,
          decoration: const InputDecoration(labelText: '서비스'),
          items: services.map((s) => DropdownMenuItem(value: s, child: Text(s, overflow: TextOverflow.ellipsis))).toList(),
          onChanged: (v) => setState(() { service = v; reviewed = false; }),
          validator: (v) => v == null ? '서비스를 선택해 주세요' : null,
        ),
        TextFormField(controller: name, decoration: const InputDecoration(labelText: '성함'),
          onChanged: (_) => setState(() => reviewed = false),
          validator: (v) => (v == null || v.trim().isEmpty) ? '성함을 입력해 주세요' : null),
        TextFormField(controller: phone, keyboardType: TextInputType.phone,
          decoration: const InputDecoration(labelText: '연락처 (숫자만)'),
          onChanged: (_) => setState(() => reviewed = false),
          validator: (v) => RegExp(r'^0[0-9]{8,10}$').hasMatch((v ?? '').replaceAll(RegExp(r'[ -]'), ''))
              ? null : '연락처를 확인해 주세요'),
        TextFormField(controller: memo, maxLines: 3,
          decoration: const InputDecoration(labelText: '희망 일정 · 모델 · 요청사항'),
          onChanged: (_) => setState(() => reviewed = false)),
        CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('상담 목적의 개인정보 수집·이용에 동의합니다.'),
          value: consent, onChanged: (v) => setState(() { consent = v ?? false; reviewed = false; })),
        FilledButton(
          onPressed: () {
            if (!formKey.currentState!.validate()) return;
            if (!consent) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('개인정보 동의가 필요합니다.')));
              return;
            }
            setState(() => reviewed = true);
          },
          child: const Text('상담 내용 확인'),
        ),
        if (reviewed) ...[
          const SizedBox(height: 16),
          Text('서비스: $service\n성함: ${name.text.trim()}\n연락처: ${phone.text.trim()}\n요청: ${memo.text.trim()}'),
          const SizedBox(height: 8),
          const Text('아직 접수되지 않았습니다. 카카오톡에서 최종 접수해 주세요.'),
          const SelectableText('https://open.kakao.com/o/sFKnP4Qi'),
        ],
      ]),
    )),
  );
}
''')
print("PASS - inquiry screen generated")
