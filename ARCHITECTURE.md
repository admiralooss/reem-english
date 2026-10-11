# Reem English — Single Student Architecture

## الهدف
منصة لطالب واحد فقط + لوحة معلم واحدة. لا يوجد تسجيل متعدد المستخدمين.

## هيكل الملفات

```
/
├─ index.html                 # واجهة الطالب
├─ teacher.html               # لوحة المعلم
├─ css/
│  └─ student.css             # تصميم الطالب المتجاوب
├─ data/
│  ├─ config.js               # الطالب الافتراضي، المستويات، الفئات
│  ├─ words.js                # الكلمات الأساسية
│  └─ tests.js                # الاختبارات - المرحلة الثانية
├─ js/
│  ├─ store.js                # طبقة التخزين
│  ├─ audio.js                # النطق الأمريكي الأنثوي
│  └─ student.js              # منطق واجهة الطالب
├─ teacher.css                # تصميم لوحة المعلم
├─ teacher.js                 # منطق لوحة المعلم
└─ supabase/
   └─ schema.sql              # مخطط المزامنة بين الأجهزة
```

## بيانات الطالب
```js
{
  id: "student-1",
  name: "ريم",
  age: null,
  currentLevelId: "starter",
  points: 0,
  completedTests: 0,
  startedAt: "ISO_DATE",
  learnedWordIds: [],
  reviewWordIds: [],
  completedDailySets: [],
  preferences: {
    fontScale: 1,
    theme: "dark",
    accent: "pink"
  }
}
```

## بيانات الكلمة
```js
{
  id: "bed",
  categoryId: "morning",
  en: "bed",
  ar: "سرير",
  pronunciation: "بِد",
  exampleEn: "I get out of bed.",
  exampleAr: "أنا أنهض من السرير.",
  image: "https://..."
}
```

## بيانات الفئة
```js
{
  id: "morning",
  nameAr: "عائلة الصباح",
  nameEn: "Morning",
  icon: "☀️",
  order: 1
}
```

## بيانات الاختبار — المرحلة الثانية
```js
{
  id: "test-001",
  title: "اختبار عائلة الصباح",
  totalPoints: 100,
  questions: [
    {
      id: "q1",
      type: "mcq | written | matching | true_false | listening",
      prompt: "...",
      options: [],
      answer: "...",
      points: 10
    }
  ]
}
```

## التخزين الحالي في المرحلة الأولى
الواجهة تعمل الآن عبر LocalStorage لسرعة بناء واعتماد تجربة الطالب والمعلم.

المفاتيح:
- `reem_single_student_profile_v1`
- `reem_single_student_content_v1`
- `reem_teacher_tests_v2`
- `reem_test_submissions_v2`

## المزامنة بين الجوال واللابتوب
LocalStorage لا ينتقل بين جهازين. لتحقيق شرط الدراسة والمتابعة من أي جهاز، المرحلة التالية تربط نفس طبقة `store.js` مع Supabase. الواجهة الحالية لا تحتاج إعادة بناء؛ نستبدل مصدر التخزين فقط.

## المرحلة الأولى المنفذة
- ملف طالب واحد.
- الاسم، العمر، المستوى، النقاط، عدد الاختبارات، نسبة التقدم.
- عداد أيام من بداية الدراسة.
- 10 كلمات يومية من عائلة الصباح.
- صور + معنى + نطق مبسط + مثال + صوت أمريكي أنثوي.
- حفظ الكلمة / إرسالها للمراجعة.
- فئات قابلة للإضافة والتعديل من لوحة المعلم.
- إضافة وتعديل وحذف الكلمات والصور من لوحة المعلم.
- إعادة تقدم الطالب من الصفر.
- إعدادات الطالب: حجم الخط، الوضع الليلي/الفاتح، لون الواجهة.
- تصميم متجاوب للجوال واللابتوب.

## المرحلة الثانية
- صانع اختبارات كامل.
- أنواع أسئلة متعددة.
- توزيع درجات.
- إرسال الاختبار للطالب.
- تصحيح ومتابعة النتائج.
- ربط Supabase للمزامنة بين الأجهزة.
