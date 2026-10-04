import { StatutoryNotice } from '../types';

export const MOCK_NOTICES: StatutoryNotice[] = [
  {
    id: 'IT-143-1-DEMAND',
    refNumber: 'IT-NOTICE-143-1-DEMAND.pdf',
    title: 'Income Tax Demand Notice u/s 143(1)',
    department: 'Central Processing Centre, Income Tax Department',
    issueDate: '2025-02-22',
    deadlineDate: '2025-03-24',
    daysRemaining: 4,
    urgency: 'CRITICAL',
    amountDemanded: '₹ 18,450',
    penaltyText: '1% per month statutory interest under Section 220(2) plus coercive penalty under Section 221(1)',
    requiredAction: {
      en: 'Submit online rectification under Section 154 for TDS mismatch or pay balance demand to avoid recovery notices.',
      kn: 'ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಿ ಅಥವಾ ಹೆಚ್ಚುವರಿ ಬಡ್ಡಿ ತಪ್ಪಿಸಲು ಬಾಕಿ ಮೊತ್ತ ಪಾವತಿಸಿ.',
      hi: 'धारा 154 के तहत ऑनलाइन सुधार याचिका दायर करें या रिकवरी नोटिस से बचने के लिए बकाया भुगतान करें।'
    },
    plainSummary: {
      en: 'The Income Tax department has flagged a discrepancy of ₹18,450 because TDS claimed in your return does not match Form 26AS. You have until March 24, 2025 to respond.',
      kn: 'ನಿಮ್ಮ ಐಟಿ ರಿಟರ್ನ್‌ನಲ್ಲಿ ಕ್ಲೈಮ್ ಮಾಡಲಾದ ಟಿಡಿಎಸ್ ಮತ್ತು ಫಾರ್ಮ್ 26AS ನಡುವೆ ₹18,450 ವ್ಯತ್ಯಾಸವಿದೆ. ಮಾರ್ಚ್ 24, 2025 ರೊಳಗೆ ಉತ್ತರಿಸಬೇಕು.',
      hi: 'आयकर विभाग ने ₹18,450 की विसंगति दर्ज की है क्योंकि आपके रिटर्न में टीडीएस 26AS से मेल नहीं खाता।'
    },
    laymanSummary: {
      en: 'In plain words: The tax office thinks you owe ₹18,450 because your employer/bank tax proof didn\'t match what you entered. If this is a mistake, you can correct it online in 5 minutes without paying. If you ignore it past March 24, a 1% monthly penalty will be added.',
      kn: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ನೀವು ಸಲ್ಲಿಸಿದ ಲೆಕ್ಕ ಮತ್ತು ಬ್ಯಾಂಕ್ ಲೆಕ್ಕದಲ್ಲಿ ₹18,450 ವ್ಯತ್ಯಾಸ ಬಂದಿದೆ. ಇದು ತಪ್ಪಾಗಿದ್ದರೆ ಹಣ ಕಟ್ಟದೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲೇ ಸರಿಪಡಿಸಬಹುದು. ಮಾರ್ಚ್ 24 ರೊಳಗೆ ಮಾಡದಿದ್ದರೆ ಪ್ರತಿ ತಿಂಗಳು 1% ದಂಡ ಬೀಳುತ್ತದೆ.',
      hi: 'साधारण शब्दों में: टैक्स विभाग का कहना है कि ₹18,450 का अंतर है। यदि यह गलती है तो आप बिना पैसे दिए ऑनलाइन सुधार कर सकते हैं। 24 मार्च के बाद 1% मासिक ब्याज लगेगा।'
    },
    understandingQuestions: [
      {
        question: 'Do you immediately have to pay the entire ₹18,450 right now?',
        explanation: 'No! If your TDS credit was genuine and it was a clerical omission, you can file an online rectification u/s 154 without paying.',
        answerKey: 'No - Rectification under Section 154 can be filed first.'
      },
      {
        question: 'What is the absolute deadline to act before extra interest applies?',
        explanation: 'March 24, 2025 (4 days remaining). Beyond this, 1% statutory monthly interest under Section 220(2) starts accumulating.',
        answerKey: 'March 24, 2025 (4 days left).'
      }
    ],
    statutoryRemedy: 'Rectification u/s 154 or Dispute under Section 246A',
    verifiedSection: 'Section 143(1)(a) & Sec 154',
    disputeAvailable: true
  },
  {
    id: 'BBMP-REV-492',
    refNumber: 'BBMP-REV/492',
    title: 'Municipal Property Tax Assessment Notice',
    department: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    issueDate: '2026-09-14',
    deadlineDate: '2026-10-14',
    daysRemaining: 3,
    urgency: 'CRITICAL',
    amountDemanded: '₹ 8,720',
    penaltyText: '2% monthly statutory interest plus cancellation of rebate certificate under KMC Act Section 108A',
    requiredAction: {
      en: 'Submit objection form or pay revised assessment difference online to avoid 2% monthly statutory interest.',
      kn: '2% ಮಾಸಿಕ ಬಡ್ಡಿಯನ್ನು ತಪ್ಪಿಸಲು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಆಕ್ಷೇಪಣೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಅಥವಾ ಪರಿಷ್ಕೃತ ತೆರಿಗೆ ಮೊತ್ತ ಪಾವತಿಸಿ.',
      hi: '2% मासिक ब्याज से बचने के लिए आपत्ति फॉर्म जमा करें या संशोधित अंतर ऑनलाइन जमा करें।'
    },
    plainSummary: {
      en: 'BBMP property zonal reclassification reassessed residential plinth area from Category IV to Category III, resulting in ₹8,720 difference.',
      kn: 'ಬಿಬಿಎಂಪಿ ನಿಮ್ಮ ನಿವಾಸದ ವಲಯ ವರ್ಗೀಕರಣವನ್ನು ಬದಲಾಯಿಸಿದ್ದು, ₹8,720 ವ್ಯತ್ಯಾಸದ ಮೊತ್ತಕ್ಕೆ ನೋಟಿಸ್ ನೀಡಲಾಗಿದೆ.',
      hi: 'बीबीएमपी ने आवासीय क्षेत्र का पुनर्मूल्यांकन किया है, जिससे ₹8,720 का अंतर आया है।'
    },
    laymanSummary: {
      en: 'In plain words: The municipality reclassified your street/zone into a higher property tax slab, calculating ₹8,720 extra. You have 3 days to either file an objection if your measurements were correct, or pay the difference before 2% monthly interest kicks in.',
      kn: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಬಿಬಿಎಂಪಿ ನಿಮ್ಮ ಏರಿಯಾವನ್ನು ಹೆಚ್ಚಿನ ತೆರಿಗೆ ವಿಭಾಗಕ್ಕೆ ಬದಲಾಯಿಸಿದೆ, ಇದರಿಂದ ₹8,720 ಹೆಚ್ಚುವರಿ ತೆರಿಗೆ ಬಂದಿದೆ. ನಿಮ್ಮ ಅಳತೆ ಸರಿಯಾಗಿದ್ದರೆ 3 ದಿನದೊಳಗೆ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಸಿ, ಇಲ್ಲವಾದರೆ ತಿಂಗಳಿಗೆ 2% ಬಡ್ಡಿ ಬೀಳುತ್ತದೆ.',
      hi: 'साधारण शब्दों में: नगर निगम ने आपके क्षेत्र का टैक्स स्लैब बढ़ा दिया है, जिससे ₹8,720 अतिरिक्त मांग की गई है। 3 दिन में आपत्ति दर्ज करें या 2% ब्याज से बचने के लिए भुगतान करें।'
    },
    understandingQuestions: [
      {
        question: 'Can you challenge this assessment if your room dimensions haven\'t changed?',
        explanation: 'Yes! Section 108A grants citizens the statutory right to file an objection petition before the Assistant Revenue Officer (ARO).',
        answerKey: 'Yes - File an Objection Petition u/s 108A.'
      },
      {
        question: 'How many days do you have before the deadline expires?',
        explanation: 'Only 3 days remaining until October 14, 2026.',
        answerKey: '3 days remaining.'
      }
    ],
    statutoryRemedy: 'Objection Petition to Assistant Revenue Officer u/s 108A',
    verifiedSection: 'Sec 108A Verified',
    disputeAvailable: true
  },
  {
    id: 'FCSD-7710',
    refNumber: 'FCSD-7710',
    title: 'Aadhaar - Ration Card e-KYC Linking',
    department: 'Dept of Food & Civil Supplies',
    issueDate: '2026-09-29',
    deadlineDate: '2026-10-29',
    daysRemaining: 18,
    urgency: 'WARNING',
    penaltyText: 'Suspension of subsidized monthly foodgrain allocation and removal of dependent beneficiary names',
    requiredAction: {
      en: 'Visit nearest Fair Price Shop or Grama One center for biometric verification to continue monthly quota.',
      kn: 'ಮಾಸಿಕ ಪಡಿತರ ಮುಂದುವರಿಸಲು ಹತ್ತಿರದ ನ್ಯಾಯಬೆಲೆ ಅಂಗಡಿ ಅಥವಾ ಗ್ರಾಮ ಒನ್ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ ಬಯೋಮೆಟ್ರಿಕ್ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಿ.',
      hi: 'मासिक कोटा जारी रखने के लिए निकटतम उचित मूल्य की दुकान या ग्राम वन केंद्र पर बायोमेट्रिक सत्यापन करवाएं।'
    },
    plainSummary: {
      en: 'Mandatory Aadhaar biometric e-KYC compliance for National Food Security Act (NFSA) beneficiary verification.',
      kn: 'ರಾಷ್ಟ್ರೀಯ ಆಹಾರ ಭದ್ರತಾ ಕಾಯ್ದೆಯಡಿ ಪಡಿತರ ಚೀಟಿ ಫಲಾನುಭವಿಗಳಿಗೆ ಕಡ್ಡಾಯ ಬಯೋಮೆಟ್ರಿಕ್ ಆಧಾರ್ ಇ-ಕೆವೈಸಿ.',
      hi: 'राष्ट्रीय खाद्य सुरक्षा अधिनियम के तहत राशन कार्ड लाभार्थियों के लिए अनिवार्य आधार बायोमेट्रिक सत्यापन।'
    },
    statutoryRemedy: 'Biometric exception grievance redressal at Taluk Tahsildar office',
    verifiedSection: 'Biometric Center Required',
    disputeAvailable: false
  },
  {
    id: 'PM-KISAN-KR',
    refNumber: 'PM-KISAN/KR',
    title: 'Kisan Samman Nidhi Annual Land Record Update',
    department: 'Department of Agriculture & Farmers Welfare',
    issueDate: '2026-10-01',
    deadlineDate: '2026-11-25',
    daysRemaining: 45,
    urgency: 'UPCOMING',
    penaltyText: 'Withholding of upcoming 19th installment (₹ 2,000 direct benefit transfer)',
    requiredAction: {
      en: 'Self-attest RTC land revenue receipt online or at Seva Kendra to maintain active installment status.',
      kn: 'ಕಂತಿನ ಹಣ ಪಡೆಯಲು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅಥವಾ ಸೇವಾ ಕೇಂದ್ರದಲ್ಲಿ ಆರ್‌ಟಿಸಿ ಭೂ ಕಂದಾಯ ರಸೀದಿಯನ್ನು ಸ್ವಯಂ-ದೃಢೀಕರಿಸಿ.',
      hi: 'सक्रिय किस्त स्थिति बनाए रखने के लिए ऑनलाइन या सेवा केंद्र पर आरटीसी भूमि राजस्व रसीद को स्व-सत्यापित करें।'
    },
    plainSummary: {
      en: 'Annual mandatory Bhoomi RTC survey link required for landholding farmers under PM-Kisan scheme guidelines.',
      kn: 'ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆಯಡಿ ಭೂಹಿಡುವಳಿ ಹೊಂದಿರುವ ರೈತರಿಗೆ ವಾರ್ಷಿಕ ಕಡ್ಡಾಯ ಭೂಮಿ ಆರ್‌ಟಿಸಿ ನವೀಕರಣ.',
      hi: 'पीएम-किसान योजना के तहत भू-स्वामित्व वाले किसानों के लिए वार्षिक अनिवार्य भूमि रिकॉर्ड नवीनीकरण।'
    },
    statutoryRemedy: 'Village Accountant endorsement or Agriculture Officer verification',
    verifiedSection: 'Self-Attestation Eligible',
    disputeAvailable: false
  }
];
