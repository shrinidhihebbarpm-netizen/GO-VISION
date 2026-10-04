import { StatutoryNotice } from '../types';

export const MOCK_NOTICES: StatutoryNotice[] = [
  {
    id: 'IT-143-1-DEMAND',
    refNumber: 'IT-NOTICE-143-1-DEMAND.pdf',
    title: 'Income Tax Demand Notice u/s 143(1)',
    titleKn: 'ಆದಾಯ ತೆರಿಗೆ ಬೇಡಿಕೆ ನೋಟಿಸ್ (ಸೆಕ್ಷನ್ 143(1))',
    titleHi: 'आयकर मांग नोटिस धारा 143(1)',
    department: 'Central Processing Centre, Income Tax Department',
    departmentKn: 'ಕೇಂದ್ರೀಯ ಸಂಸ್ಕರಣಾ ಕೇಂದ್ರ, ಆದಾಯ ತೆರಿಗೆ ಇಲಾಖೆ',
    departmentHi: 'केंद्रीय प्रसंस्करण केंद्र, आयकर विभाग',
    issueDate: '2025-02-22',
    deadlineDate: '2025-03-24',
    daysRemaining: 4,
    urgency: 'CRITICAL',
    amountDemanded: '₹ 18,450',
    penaltyText: '1% per month statutory interest under Section 220(2) plus coercive penalty under Section 221(1)',
    penaltyTextKn: 'ಸೆಕ್ಷನ್ 220(2) ರ ಅಡಿಯಲ್ಲಿ ತಿಂಗಳಿಗೆ 1% ಶಾಸನಬದ್ಧ ಬಡ್ಡಿ ಮತ್ತು ಸೆಕ್ಷನ್ 221(1) ರ ಅಡಿಯಲ್ಲಿ ದಂಡದ ಕ್ರಮಗಳು',
    penaltyTextHi: 'धारा 220(2) के तहत 1% मासिक ब्याज एवं धारा 221(1) के तहत दंडात्मक कार्रवाई',
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
    keyPoints: [
      'Discrepancy detected between TDS claimed in return and tax credit reported in Form 26AS.',
      'Prima facie adjustment under Section 143(1)(a) assesses ₹ 18,450 payable.',
      'Online rectification u/s 154 can be submitted without paying the demand if deduction is genuine.',
      'Failure to respond within limitation period attracts 1% monthly interest under Section 220(2).'
    ],
    keyPointsKn: [
      'ರಿಟರ್ನ್‌ನಲ್ಲಿ ಕ್ಲೈಮ್ ಮಾಡಲಾದ ಟಿಡಿಎಸ್ ಮತ್ತು ಫಾರ್ಮ್ 26AS ಕ್ರೆಡಿಟ್ ನಡುವೆ ವ್ಯತ್ಯಾಸ ಕಂಡುಬಂದಿದೆ.',
      'ಸೆಕ್ಷನ್ 143(1)(a) ಅಡಿಯಲ್ಲಿ ₹ 18,450 ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತವೆಂದು ಇಲಾಖೆ ನಿರ್ಧರಿಸಿದೆ.',
      'ಟಿಡಿಎಸ್ ಸರಿಯಾಗಿದ್ದರೆ ಹಣ ಪಾವತಿಸದೆ ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬಹುದು.',
      'ನಿಗದಿತ ಗಡುವಿನೊಳಗೆ ಉತ್ತರಿಸದಿದ್ದರೆ ಸೆಕ್ಷನ್ 220(2) ರ ಅಡಿಯಲ್ಲಿ ತಿಂಗಳಿಗೆ 1% ದಂಡದ ಬಡ್ಡಿ ವಿಧಿಸಲಾಗುತ್ತದೆ.'
    ],
    keyPointsHi: [
      'रिटर्न में क्लेम किए गए टीडीएस और फॉर्म 26AS क्रेडिट के बीच विसंगति पाई गई।',
      'धारा 143(1)(a) के तहत ₹ 18,450 की देयता का निर्धारण किया गया है।',
      'यदि कटौती वैध है तो बिना भुगतान किए धारा 154 के तहत ऑनलाइन सुधार दर्ज किया जा सकता है।',
      'समय सीमा के भीतर जवाब न देने पर धारा 220(2) के तहत प्रतिमाह 1% ब्याज लगेगा।'
    ],
    understandingQuestions: [
      {
        question: 'Do you immediately have to pay the entire ₹18,450 right now?',
        questionKn: 'ನೀವು ತಕ್ಷಣವೇ ₹18,450 ಮೊತ್ತವನ್ನು ಪಾವತಿಸಬೇಕೇ?',
        questionHi: 'क्या आपको तुरंत ₹18,450 का भुगतान करना होगा?',
        explanation: 'No! If your TDS credit was genuine and it was a clerical omission, you can file an online rectification u/s 154 without paying.',
        explanationKn: 'ಇಲ್ಲ! ನಿಮ್ಮ ಟಿಡಿಎಸ್ ದಾಖಲೆಗಳು ಸರಿಯಾಗಿದ್ದರೆ, ಹಣ ಪಾವತಿಸದೆ ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ಆನ್‌ಲೈನ್ ತಿದ್ದುಪಡಿ ಸಲ್ಲಿಸಬಹುದು.',
        explanationHi: 'नहीं! यदि आपका टीडीएस सही है, तो आप बिना भुगतान किए धारा 154 के तहत ऑनलाइन सुधार दर्ज कर सकते हैं।',
        answerKey: 'No - Rectification under Section 154 can be filed first.'
      },
      {
        question: 'What is the absolute deadline to act before extra interest applies?',
        questionKn: 'ಹೆಚ್ಚುವರಿ ಬಡ್ಡಿ ತಪ್ಪಿಸಲು ಅಂತಿಮ ಗಡುವು ಯಾವಾಗ?',
        questionHi: 'अतिरिक्त ब्याज से बचने के लिए अंतिम तिथि कब है?',
        explanation: 'March 24, 2025 (4 days remaining). Beyond this, 1% statutory monthly interest under Section 220(2) starts accumulating.',
        explanationKn: 'ಮಾರ್ಚ್ 24, 2025 (4 ದಿನಗಳು ಮಾತ್ರ ಬಾಕಿ). ನಂತರ ಸೆಕ್ಷನ್ 220(2) ರ ಅಡಿಯಲ್ಲಿ ಪ್ರತಿ ತಿಂಗಳು 1% ಬಡ್ಡಿ ಬೀಳುತ್ತದೆ.',
        explanationHi: '24 मार्च 2025 (4 दिन शेष)। इसके बाद धारा 220(2) के तहत 1% मासिक ब्याज लगना शुरू हो जाएगा।',
        answerKey: 'March 24, 2025 (4 days left).'
      }
    ],
    statutoryRemedy: 'Rectification u/s 154 or Dispute under Section 246A',
    statutoryRemedyKn: 'ಸೆಕ್ಷನ್ 154 ಅಡಿಯಲ್ಲಿ ತಿದ್ದುಪಡಿ ಅಥವಾ ಸೆಕ್ಷನ್ 246A ಅಡಿಯಲ್ಲಿ ಮೇಲ್ಮನವಿ',
    statutoryRemedyHi: 'धारा 154 के तहत सुधार या धारा 246A के तहत अपील',
    verifiedSection: 'Section 143(1)(a) & Sec 154',
    disputeAvailable: true
  },
  {
    id: 'BBMP-REV-492',
    refNumber: 'BBMP-REV/492',
    title: 'Municipal Property Tax Assessment Notice',
    titleKn: 'ಬಿಬಿಎಂಪಿ ಆಸ್ತಿ ತೆರಿಗೆ ಪರಿಷ್ಕರಣೆ ನೋಟಿಸ್',
    titleHi: 'नगर निगम संपत्ति कर निर्धारण नोटिस',
    department: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
    departmentKn: 'ಬೃಹತ್ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ (ಬಿಬಿಎಂಪಿ)',
    departmentHi: 'बृहद बेंगलुरु महानगर पालिका (बीबीएमपी)',
    issueDate: '2026-09-14',
    deadlineDate: '2026-10-14',
    daysRemaining: 3,
    urgency: 'CRITICAL',
    amountDemanded: '₹ 8,720',
    penaltyText: '2% monthly statutory interest plus cancellation of rebate certificate under KMC Act Section 108A',
    penaltyTextKn: 'ಕೆಎಂಸಿ ಕಾಯಿದೆ ಸೆಕ್ಷನ್ 108A ಅಡಿಯಲ್ಲಿ ತಿಂಗಳಿಗೆ 2% ಶಾಸನಬದ್ಧ ಬಡ್ಡಿ ಮತ್ತು ರಿಯಾಯಿತಿ ರದ್ದತಿ',
    penaltyTextHi: 'केएमसी अधिनियम धारा 108A के तहत 2% मासिक ब्याज एवं छूट प्रमाण पत्र रद्द होना',
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
    keyPoints: [
      'Zonal classification revised from Category IV to Category III under Self Assessment Scheme (SAS).',
      'Differential property tax liability computed at ₹ 8,720.',
      'Statutory 30-day window available to lodge objection before the jurisdictional Assistant Revenue Officer (ARO).'
    ],
    keyPointsKn: [
      'ಸ್ವಯಂ ಮೌಲ್ಯಮಾಪನ ಯೋಜನೆ (SAS) ಅಡಿಯಲ್ಲಿ ವಲಯ ವರ್ಗೀಕರಣವನ್ನು ವರ್ಗ IV ರಿಂದ III ಕ್ಕೆ ಪರಿಷ್ಕರಿಸಲಾಗಿದೆ.',
      'ಪರಿಷ್ಕೃತ ವ್ಯತ್ಯಾಸದ ಆಸ್ತಿ ತೆರಿಗೆ ಬಾಕಿ ₹ 8,720 ಆಗಿದೆ.',
      'ಸಹಾಯಕ ಕಂದಾಯ ಅಧಿಕಾರಿಗಳ (ARO) ಮುಂದೆ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಸಲು ಅವಕಾಶವಿದೆ.'
    ],
    keyPointsHi: [
      'स्व-मूल्यांकन योजना (एसएएस) के तहत जोनल वर्गीकरण को श्रेणी IV से III में बदला गया।',
      'संशोधित संपत्ति कर अंतर ₹ 8,720 निर्धारित किया गया है।',
      'क्षेत्रीय सहायक राजस्व अधिकारी (एआरओ) के समक्ष आपत्ति दर्ज की जा सकती है।'
    ],
    understandingQuestions: [
      {
        question: 'Can you challenge this assessment if your room dimensions haven\'t changed?',
        questionKn: 'ನಿಮ್ಮ ಮನೆಯ ಅಳತೆ ಬದಲಾಗದಿದ್ದಲ್ಲಿ ನೀವು ಈ ತೆರಿಗೆಯನ್ನು ಪ್ರಶ್ನಿಸಬಹುದೇ?',
        questionHi: 'यदि आपके कमरे का आकार नहीं बदला है तो क्या आप इस निर्धारण को चुनौती दे सकते हैं?',
        explanation: 'Yes! Section 108A grants citizens the statutory right to file an objection petition before the Assistant Revenue Officer (ARO).',
        explanationKn: 'ಹೌದು! ಕೆಎಂಸಿ ಕಾಯಿದೆ ಸೆಕ್ಷನ್ 108A ಅಡಿಯಲ್ಲಿ ಸಹಾಯಕ ಕಂದಾಯ ಅಧಿಕಾರಿಗೆ ಆಕ್ಷೇಪಣೆ ಸಲ್ಲಿಸಲು ಹಕ್ಕಿದೆ.',
        explanationHi: 'हाँ! धारा 108A के तहत सहायक राजस्व अधिकारी के समक्ष आपत्ति याचिका दायर करने का अधिकार है।',
        answerKey: 'Yes - File an Objection Petition u/s 108A.'
      },
      {
        question: 'How many days do you have before the deadline expires?',
        questionKn: 'ಗಡುವು ಮುಗಿಯಲು ಇನ್ನು ಎಷ್ಟು ದಿನಗಳು ಬಾಕಿ ಇವೆ?',
        questionHi: 'समय सीमा समाप्त होने में कितने दिन शेष हैं?',
        explanation: 'Only 3 days remaining until October 14, 2026.',
        explanationKn: 'ಅಕ್ಟೋಬರ್ 14, 2026 ರವರೆಗೆ ಇನ್ನು ಕೇವಲ 3 ದಿನಗಳು ಮಾತ್ರ ಬಾಕಿ ಉಳಿದಿವೆ.',
        explanationHi: '14 अक्टूबर 2026 तक केवल 3 दिन शेष हैं।',
        answerKey: '3 days remaining.'
      }
    ],
    statutoryRemedy: 'Objection Petition to Assistant Revenue Officer u/s 108A',
    statutoryRemedyKn: 'ಸೆಕ್ಷನ್ 108A ಅಡಿಯಲ್ಲಿ ಸಹಾಯಕ ಕಂದಾಯ ಅಧಿಕಾರಿಗೆ ಆಕ್ಷೇಪಣೆ ಅರ್ಜಿ',
    statutoryRemedyHi: 'धारा 108A के तहत सहायक राजस्व अधिकारी को आपत्ति याचिका',
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
  },
  {
    id: 'BESCOM-OVERDUE-01',
    refNumber: 'BESCOM/DISC/RR-29401',
    title: 'BESCOM Final Electricity Disconnection Notice (Passed Due Date)',
    titleKn: 'ಬೆಸ್ಕಾಂ ಅಂತಿಮ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತ ನೋಟಿಸ್ (ಅಂತಿಮ ಗಡುವು ಮೀರಿದೆ)',
    titleHi: 'बेस्कॉम अंतिम बिजली कनेक्शन विच्छेदन नोटिस (देय तिथि समाप्त)',
    department: 'Bangalore Electricity Supply Company (BESCOM)',
    departmentKn: 'ಬೆಂಗಳೂರು ವಿದ್ಯುತ್ ಸರಬರಾಜು ಕಂಪನಿ ನಿಯಮಿತ (ಬೆಸ್ಕಾಂ)',
    departmentHi: 'बैंगलोर बिजली आपूर्ति कंपनी (बेस्कॉम)',
    issueDate: '2026-08-25',
    deadlineDate: '2026-09-20',
    daysRemaining: -14,
    isOverdue: true,
    daysOverdue: 14,
    hasNoDueDate: false,
    formattedDeadline: 'September 20, 2026',
    formattedIssueDate: 'August 25, 2026',
    urgency: 'CRITICAL',
    amountDemanded: '₹ 4,320',
    penaltyText: '₹250 disconnection surcharge plus 1.5% statutory monthly delay penalty under Karnataka Electricity Regulatory Commission (KERC) regulations.',
    penaltyTextKn: 'ಕರ್ನಾಟಕ ವಿದ್ಯುತ್ ನಿಯಂತ್ರಣ ಆಯೋಗದ ನಿಯಮಾವಳಿಗಳ ಅಡಿಯಲ್ಲಿ ₹250 ಮರುಸಂಪರ್ಕ ಶುಲ್ಕ ಮತ್ತು ತಿಂಗಳಿಗೆ 1.5% ದಂಡದ ಬಡ್ಡಿ.',
    penaltyTextHi: 'केईआरसी नियमों के तहत ₹250 पुनः संयोजन शुल्क एवं 1.5% मासिक विलंब शुल्क।',
    requiredAction: {
      en: 'Immediate settlement required at BESCOM subdivision or online portal to revoke pending disconnection order.',
      kn: 'ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತ ಆದೇಶವನ್ನು ಹಿಂಪಡೆಯಲು ಬೆಸ್ಕಾಂ ಉಪವಿಭಾಗದಲ್ಲಿ ಅಥವಾ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ತಕ್ಷಣವೇ ಬಾಕಿ ಪಾವತಿಸಿ.',
      hi: 'लंबित विच्छेदन आदेश को रद्द कराने के लिए बेस्कॉम उपखंड में या ऑनलाइन पोर्टल पर तुरंत भुगतान करें।'
    },
    plainSummary: {
      en: 'This document has passed its due date on September 20, 2026 (Overdue by 14 days). Total arrears of ₹4,320 are overdue with disconnection warrant pending.',
      kn: 'ಈ ದಾಖಲೆಯ ಅಂತಿಮ ಗಡುವು ಸೆಪ್ಟೆಂಬರ್ 20, 2026 ಕ್ಕೆ ಈಗಾಗಲೇ ಮೀರಿದೆ (14 ದಿನಗಳು ಕಳೆದಿವೆ). ₹4,320 ಬಾಕಿ ಉಳಿದಿದ್ದು ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತದ ಎಚ್ಚರಿಕೆ ನೀಡಲಾಗಿದೆ.',
      hi: 'इस दस्तावेज की देय तिथि 20 सितंबर 2026 को समाप्त हो चुकी है (14 दिन बीत चुके हैं)। ₹4,320 का बकाया तुरंत देय है।'
    },
    laymanSummary: {
      en: 'In plain words: The payment deadline passed 14 days ago on September 20, 2026. The power company has issued a disconnection order for ₹4,320 arrears. You must pay immediately today to prevent your meter from being disconnected.',
      kn: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಸೆಪ್ಟೆಂಬರ್ 20, 2026 ರ ನಿಗದಿತ ಗಡುವು ಮುಗಿದು ಈಗಾಗಲೇ 14 ದಿನಗಳು ಕಳೆದಿವೆ. ₹4,320 ಬಾಕಿ ಪಾವತಿಸದಿದ್ದರೆ ಲೈನ್ ಕಟ್ ಮಾಡುವ ಆದೇಶವಿದೆ. ಲೈನ್ ಕಟ್ ಆಗುವುದನ್ನು ತಪ್ಪಿಸಲು ಇಂದೇ ತಕ್ಷಣ ಹಣ ಪಾವತಿಸಿ.',
      hi: 'साधारण शब्दों में: इस नोटिस की अंतिम तिथि 20 सितंबर 2026 को 14 दिन पहले ही समाप्त हो चुकी है। ₹4,320 का बकाया न देने पर बिजली काटे जाने का आदेश है। लाइन कटने से बचने के लिए तुरंत भुगतान करें।'
    },
    keyPoints: [
      'Statutory due date passed on September 20, 2026 (Overdue by 14 days).',
      'Electricity supply subject to physical disconnection under Section 56 of Electricity Act 2003.',
      'Total unpaid arrears stand at ₹ 4,320 including statutory delayed payment surcharge.'
    ],
    keyPointsKn: [
      'ಸೆಪ್ಟೆಂಬರ್ 20, 2026 ರ ಅಂತಿಮ ಗಡುವು ಈಗಾಗಲೇ ಮೀರಿದೆ (14 ದಿನಗಳು ಕಳೆದಿವೆ).',
      'ವಿದ್ಯುತ್ ಕಾಯಿದೆ 2003 ರ ಸೆಕ್ಷನ್ 56 ರ ಅಡಿಯಲ್ಲಿ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಬಹುದು.',
      'ದಂಡದ ಶುಲ್ಕ ಸೇರಿ ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಬಾಕಿ ₹ 4,320 ಆಗಿದೆ.'
    ],
    keyPointsHi: [
      'वैधानिक अंतिम तिथि 20 सितंबर 2026 को समाप्त हो चुकी है (14 दिन का विलंब)।',
      'विद्युत अधिनियम 2003 की धारा 56 के तहत बिजली कनेक्शन कभी भी काटा जा सकता है।',
      'विलंब अधिभार सहित कुल देय राशि ₹ 4,320 है।'
    ],
    understandingQuestions: [
      {
        question: 'Has the deadline for this notice already expired?',
        questionKn: 'ಈ ನೋಟಿಸ್‌ನ ಅಂತಿಮ ಗಡುವು ಈಗಾಗಲೇ ಮೀರಿದೆಯೇ?',
        questionHi: 'क्या इस नोटिस की अंतिम तिथि पहले ही समाप्त हो चुकी है?',
        explanation: 'Yes! The deadline passed on September 20, 2026 and is currently 14 days overdue.',
        explanationKn: 'ಹೌದು! ಸೆಪ್ಟೆಂಬರ್ 20, 2026 ಕ್ಕೆ ಗಡುವು ಮುಗಿದಿದ್ದು, ಈಗಾಗಲೇ 14 ದಿನಗಳು ಕಳೆದಿವೆ.',
        explanationHi: 'हाँ! अंतिम तिथि 20 सितंबर 2026 को समाप्त हो चुकी है और अब 14 दिन का विलंब है।',
        answerKey: 'Yes - Overdue by 14 days.'
      }
    ],
    statutoryRemedy: 'Grievance / Appeal before Consumer Grievance Redressal Forum (CGRF) u/s 42(5)',
    statutoryRemedyKn: 'ಗ್ರಾಹಕರ ಕುಂದುಕೊರತೆ ನಿವಾರಣಾ ವೇದಿಕೆ (CGRF) ಮುಂದೆ ಮೇಲ್ಮನವಿ',
    statutoryRemedyHi: 'उपभोक्ता शिकायत निवारण फोरम (सीजीआरएफ) के समक्ष अपील',
    verifiedSection: 'Electricity Act Sec 56 (Overdue)',
    disputeAvailable: true
  },
  {
    id: 'CIVIC-INFO-CIRCULAR',
    refNumber: 'GOV/KAR/REV/CIR-2026-88',
    title: 'Karnataka State Citizen Services & e-Governance Advisory Circular',
    titleKn: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವೆಗಳು ಮತ್ತು ಇ-ಆಡಳಿತ ಮಾಹಿತಿ ಸುತ್ತೋಲೆ',
    titleHi: 'कर्नाटक राज्य नागरिक सेवाएं एवं ई-गवर्नेंस परामर्श परिपत्र',
    department: 'Department of Personnel & Administrative Reforms (e-Governance)',
    departmentKn: 'ಸಿಬ್ಬಂದಿ ಮತ್ತು ಆಡಳಿತ ಸುಧಾರಣೆಗಳ ಇಲಾಖೆ (ಇ-ಆಡಳಿತ)',
    departmentHi: 'कार्मिक एवं प्रशासनिक सुधार विभाग (ई-गवर्नेंस)',
    issueDate: '2026-09-10',
    deadlineDate: null,
    daysRemaining: null,
    hasNoDueDate: true,
    isOverdue: false,
    daysOverdue: 0,
    formattedIssueDate: 'September 10, 2026',
    urgency: 'UPCOMING',
    amountDemanded: 'None (Informational Circular)',
    penaltyText: 'None - Informational compliance guidelines for citizens accessing unified portal services.',
    penaltyTextKn: 'ಯಾವುದೇ ದಂಡವಿಲ್ಲ - ಏಕೀಕೃತ ಪೋರ್ಟಲ್ ಸೇವೆಗಳನ್ನು ಪಡೆಯಲು ನಾಗರಿಕರಿಗೆ ಮಾಹಿತಿ ಮಾರ್ಗಸೂಚಿ.',
    penaltyTextHi: 'कोई जुर्माना नहीं - एकीकृत पोर्टल सेवाओं के उपयोग के लिए नागरिक सूचना दिशानिर्देश।',
    requiredAction: {
      en: 'No statutory deadline. Citizens may update their profiles at their convenience on the Seva Sindhu / Bangalore One portal.',
      kn: 'ಯಾವುದೇ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ. ನಾಗರಿಕರು ಸೇವಾ ಸಿಂಧು ಅಥವಾ ಬೆಂಗಳೂರು ಒನ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ತಮ್ಮ ಅನುಕೂಲಕ್ಕೆ ತಕ್ಕಂತೆ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಬಹುದು.',
      hi: 'कोई देय तिथि उल्लिखित नहीं है। नागरिक अपनी सुविधानुसार सेवा सिंधु पोर्टल पर प्रोफाइल अपडेट कर सकते हैं।'
    },
    plainSummary: {
      en: 'This is an informative administrative advisory circular issued on September 10, 2026. No statutory due date or deadline is specified in this document.',
      kn: 'ಇದು ಸೆಪ್ಟೆಂಬರ್ 10, 2026 ರಂದು ಹೊರಡಿಸಲಾದ ಮಾಹಿತಿ ಸುತ್ತೋಲೆಯಾಗಿದೆ. ಈ ದಾಖಲೆಯಲ್ಲಿ ಯಾವುದೇ ಶಾಸನಬದ್ಧ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ.',
      hi: 'यह 10 सितंबर 2026 को जारी एक सूचनात्मक परिपत्र है। इस दस्तावेज में कोई विशिष्ट देय तिथि उल्लिखित नहीं है।'
    },
    laymanSummary: {
      en: 'In plain words: This document is a helpful information advisory from the government, not an urgent penalty notice. There is no due date or deadline mentioned in this document. You do not need to worry about any expiration or penalties.',
      kn: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ: ಇದು ಸರ್ಕಾರದಿಂದ ಬಂದಿರುವ ಮಾಹಿತಿ ಮಾರ್ಗದರ್ಶಿಯಾಗಿದೆ, ಯಾವುದೇ ದಂಡ ಅಥವಾ ಎಚ್ಚರಿಕೆ ನೋಟಿಸ್ ಅಲ್ಲ. ಈ ದಾಖಲೆಯಲ್ಲಿ ಯಾವುದೇ ಕೊನೆಯ ದಿನಾಂಕ ಅಥವಾ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ. ಅವಧಿ ಮುಕ್ತಾಯದ ಬಗ್ಗೆ ಚಿಂತಿಸುವ ಅಗತ್ಯವಿಲ್ಲ.',
      hi: 'साधारण शब्दों में: यह सरकार द्वारा जारी एक सूचनात्मक परिपत्र है, कोई जुर्माना नोटिस नहीं। इस दस्तावेज में कोई अंतिम तिथि या समय सीमा उल्लिखित नहीं है।'
    },
    keyPoints: [
      'Document contains informational advisory guidelines for citizen portal access.',
      'No statutory due date or expiration deadline is mentioned in this document.',
      'No fines, late fees, or legal penalties apply.'
    ],
    keyPointsKn: [
      'ನಾಗರಿಕ ಸೇವಾ ಪೋರ್ಟಲ್‌ಗಳನ್ನು ಬಳಸಲು ಮಾಹಿತಿ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಒಳಗೊಂಡಿದೆ.',
      'ಈ ದಾಖಲೆಯಲ್ಲಿ ಯಾವುದೇ ಶಾಸನಬದ್ಧ ಅಂತಿಮ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ.',
      'ಯಾವುದೇ ದಂಡ ಅಥವಾ ಶುಲ್ಕಗಳು ಅನ್ವಯಿಸುವುದಿಲ್ಲ.'
    ],
    keyPointsHi: [
      'नागरिक सेवा पोर्टल उपयोग के लिए सूचनात्मक दिशानिर्देश शामिल हैं।',
      'इस दस्तावेज में कोई विशिष्ट देय तिथि या समय सीमा उल्लिखित नहीं है।',
      'कोई जुर्माना या कानूनी कार्रवाई लागू नहीं है।'
    ],
    understandingQuestions: [
      {
        question: 'Is there any due date or expiration mentioned in this document?',
        questionKn: 'ಈ ದಾಖಲೆಯಲ್ಲಿ ಯಾವುದೇ ಅಂತಿಮ ದಿನಾಂಕ ಅಥವಾ ಗಡುವನ್ನು ನಮೂದಿಸಲಾಗಿದೆಯೇ?',
        questionHi: 'क्या इस दस्तावेज में कोई देय तिथि या समय सीमा उल्लिखित है?',
        explanation: 'No! There is no due date mentioned anywhere in this circular. It is for informational guidance only.',
        explanationKn: 'ಇಲ್ಲ! ಈ ಸುತ್ತೋಲೆಯಲ್ಲಿ ಯಾವುದೇ ಕೊನೆಯ ದಿನಾಂಕವನ್ನು ನಮೂದಿಸಲಾಗಿಲ್ಲ. ಇದು ಕೇವಲ ಮಾಹಿತಿ ಮಾರ್ಗದರ್ಶಿಯಾಗಿದೆ.',
        explanationHi: 'नहीं! इस परिपत्र में कोई देय तिथि उल्लिखित नहीं है। यह केवल सूचना के लिए है।',
        answerKey: 'No due date.'
      }
    ],
    statutoryRemedy: 'Informational advisory only - No dispute required',
    statutoryRemedyKn: 'ಮಾಹಿತಿ ಸುತ್ತೋಲೆ ಮಾತ್ರ - ಯಾವುದೇ ಆಕ್ಷೇಪಣೆ ಅಗತ್ಯವಿಲ್ಲ',
    statutoryRemedyHi: 'केवल सूचनात्मक परिपत्र - किसी विवाद की आवश्यकता नहीं',
    verifiedSection: 'Advisory Circular',
    disputeAvailable: false
  }
];
