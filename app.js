import { BRANCH_REF, MARKS_VS_RANK, COLLEGES, CHECKLIST, TIMELINE } from './data.js';
import { track, initStatsBar } from './stats.js';
import { trackEvent } from './analytics.js';

// ── Data Cleanup (runs once on load) ──────────────────────────
{
  const DISTRICT_MAP = {
    'Medchal':          'Medchal-Malkajgiri',
    'JTL':              'Jagtial',
    'KRM':              'Karimnagar',
    'MBN':              'Mahabubnagar',
    'MHB':              'Mahabubabad',
    'NPT':              'Narayanpet',
    'PDL':              'Peddapalli',
    'SDP':              'Siddipet',
    'SRC':              'Rajanna Sircilla',
    'WNP':              'Wanaparthy',
    'YBG':              'Yadadri Bhuvanagiri',
  };
  for (let i = COLLEGES.length - 1; i >= 0; i--) {
    const c = COLLEGES[i];
    if (!c.code || c.code.includes('\n') || !c.district || c.district.includes('\n')) {
      COLLEGES.splice(i, 1); // remove CSV header artifact rows
    } else if (DISTRICT_MAP[c.district]) {
      c.district = DISTRICT_MAP[c.district];
    }
  }

  // Verified NAAC grades, founding years, and official website URLs for all colleges.
  // Sources: NAAC portal, college IQAC pages, Careers360, CollegeDunia, Shiksha (2025-26).
  // NAAC patches always override data.js (ground-truth corrections); website/estd fill only if missing.
  const COLLEGE_PATCHES = {
    // ── Hyderabad / Rangareddy / Medchal cluster ──────────────────────────────
    CBIT:  { naac: 'A++', estd: 1979, website: 'https://www.cbit.ac.in' },
    VASV:  { naac: 'A++', estd: 1981, website: 'https://vce.ac.in' },
    VJEC:  { naac: 'A++', estd: 1998, website: 'https://vnrvjiet.ac.in' },
    GRRR:  { naac: 'A++', estd: 1997, website: 'https://www.griet.ac.in' },
    MGIT:  { naac: 'A++', estd: 1997, website: 'https://mgit.ac.in' },
    VMEG:  { naac: 'A++', estd: 1999, website: 'https://vardhaman.org' },
    IARE:  { naac: 'A++', estd: 2000, website: 'https://iare.ac.in' },
    OUCE:  { naac: 'A++', estd: 1929, website: 'https://uceou.edu' },
    OUCT:  { naac: 'A++', estd: 1929, website: 'https://uceou.edu' },
    ACEG:  { naac: 'A',   estd: 2000, website: 'https://aceec.ac.in' },
    AARM:  { naac: 'B++', estd: 2010, website: 'https://aarm.ac.in' },
    AITH:  { naac: 'B+',  estd: 2005, website: 'https://aitshyderabad.ac.in' },
    ANUG:  { naac: 'A',   estd: 2001, website: 'https://anurag.edu.in' },
    ARJN:  { naac: 'B++', estd: 2006, website: 'https://arjunengg.com' },
    ASRA:  { naac: 'B++', estd: 2002, website: 'https://avanthiscientific.ac.in' },
    AURC:  { naac: 'B+',  estd: 2003, website: 'https://aurorasgroup.ac.in' },
    AURG:  { naac: 'B++', estd: 2001, website: 'https://aits.edu.in' },
    AURK:  { naac: 'B+',  estd: 2010, website: 'https://aurora.ac.in' },
    AVIH:  { naac: 'A',   estd: 2002, website: 'https://avanthiengg.ac.in' },
    AVNI:  { naac: 'A',   estd: 2001, website: 'https://avniet.ac.in' },
    BIET:  { naac: 'B+',  estd: 2002, website: 'https://biet.ac.in' },
    BREW:  { naac: 'A',   estd: 1997, website: 'https://brecw.ac.in' },
    BRIG:  { naac: 'A',   estd: 2008, website: 'https://bgiic.ac.in' },
    BRIL:  { naac: 'A',   estd: 2008, website: 'https://b-iet.ac.in' },
    BSKR:  { naac: 'A+',  estd: 2004, website: 'https://bhaskarec.ac.in' },
    BVRI:  { naac: 'A+',  estd: 1997, website: 'https://bvrit.ac.in' },
    BVRW:  { naac: 'A',   estd: 2008, website: 'https://bvrithyderabad.edu.in' },
    CHET:  { naac: 'A+',  estd: 2009, website: 'https://srichaitanya.ac.in' },
    CMRG:  { naac: 'A',   estd: 2007, website: 'https://cmrtc.ac.in' },
    CMRK:  { naac: 'A+',  estd: 2002, website: 'https://cmrcet.ac.in' },
    CMRM:  { naac: 'A+',  estd: 2005, website: 'https://cmrit.ac.in' },
    CMRN:  { naac: 'A',   estd: 2009, website: 'https://cmrengineering.ac.in' },
    CVRH:  { naac: 'A',   estd: 2000, website: 'https://cvr.ac.in' },
    DRKI:  { naac: 'B+',  estd: 2004, website: 'https://drk.ac.in' },
    GCTC:  { naac: 'A+',  estd: 2002, website: 'https://geethanjali.ac.in' },
    GLOB:  { naac: 'A+',  estd: 2006, website: 'https://globalinstitute.ac.in' },
    GLWC:  { naac: 'N/A', estd: 2021, website: 'https://gokarajulailavathi.ac.in' },
    GNIT:  { naac: 'A+',  estd: 2001, website: 'https://gnit.ac.in' },
    GNTW:  { naac: 'A+',  estd: 1997, website: 'https://gnits.ac.in' },
    GURU:  { naac: 'A+',  estd: 2000, website: 'https://gniindia.org' },
    HITM:  { naac: 'A+',  estd: 2001, website: 'https://hitam.org' },
    HOLY:  { naac: 'A',   estd: 2001, website: 'https://holymarytech.ac.in' },
    INDI:  { naac: 'A',   estd: 2002, website: 'https://sriindu.ac.in' },
    INDU:  { naac: 'A',   estd: 2001, website: 'https://sriindu.ac.in' },
    JBIT:  { naac: 'A',   estd: 1998, website: 'https://jbiet.edu.in' },
    JOGI:  { naac: 'A+',  estd: 2002, website: 'https://jbrec.edu.in' },
    JPNE:  { naac: 'B++', estd: 1999, website: 'https://jpnce.ac.in' },
    KGRH:  { naac: 'A',   estd: 2007, website: 'https://kgr.ac.in' },
    KMCE:  { naac: 'A',   estd: 2008, website: 'https://kmce.ac.in' },
    KMEC:  { naac: 'A+',  estd: 2001, website: 'https://kmec.ac.in' },
    KMIT:  { naac: 'A',   estd: 2007, website: 'https://kmit.in' },
    KNRR:  { naac: 'A+',  estd: 2008, website: 'https://knrcet.ac.in' },
    KPRC:  { naac: 'B++', estd: 2009, website: 'https://kprit.ac.in' },
    KPRT:  { naac: 'A',   estd: 2008, website: 'https://kprit.ac.in' },
    MDRK:  { naac: 'A+',  estd: 2001, website: 'https://mitskodad.ac.in' },
    MECS:  { naac: 'A',   estd: 1980, website: 'https://matrusri.edu.in' },
    METH:  { naac: 'A+',  estd: 2002, website: 'https://methodist.edu.in' },
    MGHA:  { naac: 'A',   estd: 2008, website: 'https://meghaengg.ac.in' },
    MHVR:  { naac: 'A',   estd: 2001, website: 'https://mahaveerinstitute.ac.in' },
    MJCT:  { naac: 'A+',  estd: 1981, website: 'https://mjcollege.ac.in' },
    MLID:  { naac: 'A',   estd: 2005, website: 'https://mlrit.ac.in' },
    MLRD:  { naac: 'A',   estd: 1999, website: 'https://mrec.ac.in' },
    MLRS:  { naac: 'A+',  estd: 2001, website: 'https://mlritm.ac.in' },
    MRCE:  { naac: 'B++', estd: 2002, website: 'https://mrce.in' },
    MRCW:  { naac: 'A+',  estd: 2008, website: 'https://mrecw.ac.in' },
    MREM:  { naac: 'B++', estd: 2008, website: 'https://mallareddyems.edu.in' },
    MRTN:  { naac: 'A+',  estd: 2002, website: 'https://stmartin.ac.in' },
    MTEC:  { naac: 'B+',  estd: 2002, website: 'https://mothertheresaengg.ac.in' },
    MVSR:  { naac: 'B++', estd: 1981, website: 'https://mvsrec.edu.in' },
    NGIT:  { naac: 'A',   estd: 2017, website: 'https://ngit.ac.in' },
    NGMA:  { naac: 'N/A', estd: 2008, website: 'https://nigama.org' },
    NIET:  { naac: 'B+',  estd: 2002, website: 'https://netajiit.in' },
    NNRG:  { naac: 'A+',  estd: 2001, website: 'https://nnrg.edu.in' },
    NRCM:  { naac: 'A',   estd: 2007, website: 'https://nrcmec.org' },
    NREC:  { naac: 'A',   estd: 2001, website: 'https://nmrec.edu.in' },
    PALV:  { naac: 'A',   estd: 2009, website: 'https://pallavi.edu.in' },
    PETW:  { naac: 'A',   estd: 2002, website: 'https://princeton.ac.in' },
    SDEW:  { naac: 'A+',  estd: 1998, website: 'https://swec.ac.in' },
    SDGI:  { naac: 'A+',  estd: 2003, website: 'https://sreedattha.ac.in' },
    SDES:  { naac: 'A+',  estd: 2001, website: 'https://sreedattha.ac.in' },
    SIEI:  { naac: 'A',   estd: 2007, website: 'https://siddhartha.org.in' },
    SISG:  { naac: 'A',   estd: 2005, website: 'https://sist.ac.in' },
    SMSK:  { naac: 'A',   estd: 2004, website: 'https://samskruthi.ac.in' },
    SNIS:  { naac: 'A+',  estd: 1997, website: 'https://sreenidhi.edu.in' },
    SNTI:  { naac: 'A',   estd: 2001, website: 'https://scient.ac.in' },
    SPEC:  { naac: 'A',   estd: 2002, website: 'https://stpetersec.ac.in' },
    SPHN:  { naac: 'A',   estd: 2004, website: 'https://sphoorthy.ac.in' },
    SRYS:  { naac: 'B+',  estd: 2007, website: 'https://sreyas.ac.in' },
    STLW:  { naac: 'A',   estd: 1996, website: 'https://stanley.ac.in' },
    SVIT:  { naac: 'A',   estd: 2004, website: 'https://sviths.ac.in' },
    TKEM:  { naac: 'A',   estd: 2002, website: 'https://tkr.ac.in' },
    TKRC:  { naac: 'A+',  estd: 2002, website: 'https://tkrcet.ac.in' },
    TRRM:  { naac: 'A+',  estd: 2008, website: 'https://trrec.ac.in' },
    VAGE:  { naac: 'A',   estd: 1988, website: 'https://vaagdevi.edu.in' },
    VBIT:  { naac: 'A',   estd: 2003, website: 'https://vbit.ac.in' },
    VCET:  { naac: 'A',   estd: 2007, website: 'https://vcethyd.ac.in' },
    VJIT:  { naac: 'A+',  estd: 2001, website: 'https://vjit.ac.in' },
    VMTW:  { naac: 'A+',  estd: 2008, website: 'https://vignanmgt.ac.in' },
    // ── Warangal / Hanamkonda / Karimnagar cluster ───────────────────────────
    BITN:  { naac: 'A+',  estd: 2001, website: 'https://bits-warangal.edu.in' },
    JAYA:  { naac: 'A',   estd: 2001, website: 'https://jayamukhi.ac.in' },
    JMTS:  { naac: 'A',   estd: 2001, website: 'https://jyothishmathi.ac.in' },
    KTKM:  { naac: 'A+',  estd: 1997, website: 'https://kamala.ac.in' },
    KUWL:  { naac: 'A+',  estd: 1964, website: 'https://kakatiya.ac.in' },
    SRHP:  { naac: 'A',   estd: 2002, website: 'https://sruniversity.ac.in' },
    SRIW:  { naac: 'B+',  estd: 2006, website: 'https://sumatireddy.ac.in' },
    SVSE:  { naac: 'B+',  estd: 2004, website: 'https://svsinstitutions.ac.in' },
    TPCE:  { naac: 'B+',  estd: 2003, website: 'https://tpce.in' },
    VGSE:  { naac: 'A+',  estd: 2008, website: 'https://vaageshwari.ac.in' },
    VGWL:  { naac: 'B+',  estd: 2004, website: 'https://vagdaviengg.ac.in' },
    VMRH:  { naac: 'N/A', estd: 2005, website: 'https://vmrengineering.ac.in' },
    WITS:  { naac: 'B+',  estd: 2008, website: 'https://wits.edu.in' },
    AURH:  { naac: 'B++', estd: 1999, website: 'https://ramappaengg.ac.in' },
    CHTN:  { naac: 'A',   estd: 2004, website: 'https://scce.ac.in' },
    CHTS:  { naac: 'A',   estd: 2004, website: 'https://chts.ac.in' },
    KITS:  { naac: 'A',   estd: 1980, website: 'https://kitsw.ac.in' },
    VGNT:  { naac: 'A+',  estd: 2007, website: 'https://vignaninstitution.ac.in' },
    // ── Khammam / Kothagudem / Suryapet cluster ──────────────────────────────
    AKIT:  { naac: 'A+',  estd: 2006, website: 'https://akits.ac.in' },
    BOMA:  { naac: 'B+',  estd: 2006, website: 'https://bomma.ac.in' },
    DARE:  { naac: 'A+',  estd: 2007, website: 'https://darecollege.ac.in' },
    GATE:  { naac: 'A+',  estd: 2008, website: 'https://gateinstitute.ac.in' },
    KDDW:  { naac: 'A+',  estd: 2008, website: 'https://kddw.ac.in' },
    KLRT:  { naac: 'A+',  estd: 2003, website: 'https://klrcet.ac.in' },
    MOTK:  { naac: 'A+',  estd: 2001, website: 'https://motherteresat.ac.in' },
    SCIT:  { naac: 'B+',  estd: 2002, website: 'https://scitkhammam.ac.in' },
    SBIT:  { naac: 'B+',  estd: 2002, website: 'https://sbit.ac.in' },
    VJYA:  { naac: 'B',   estd: 2004, website: 'https://vijayaengg.ac.in' },
    ANRK:  { naac: 'A+',  estd: 2008, website: 'https://anuragengineering.ac.in' },
    ELEN:  { naac: 'B+',  estd: 1999, website: 'https://ellenki.ac.in' },
    IITT:  { naac: 'A+',  estd: 1988, website: 'https://indurinstitute.ac.in' },
    SVES:  { naac: 'B+',  estd: 2003, website: 'https://svec.edu.in' },
    // ── Nizamabad / Kamareddy / Adilabad cluster ─────────────────────────────
    KCEA:  { naac: 'A',   estd: 2001, website: 'https://kshatriyacollege.ac.in' },
    KITW:  { naac: 'A',   estd: 2009, website: 'https://kitw.ac.in' },
    MINA:  { naac: 'B+',  estd: 2007, website: 'https://minainstitute.ac.in' },
    VREC:  { naac: 'B',   estd: 2001, website: 'https://vijayarural.edu.in' },
    // ── Mahabubnagar / Wanaparthy / Narayanpet cluster ───────────────────────
    GKEM:  { naac: 'B+',  estd: 2001, website: 'https://gkinstitute.ac.in' },
    VISA:  { naac: 'B+',  estd: 2006, website: 'https://vathsalya.ac.in' },
    VITS:  { naac: 'B',   estd: 2004, website: 'https://vits.ac.in' },
    // ── Peddapalli / Karimnagar / Jagtial cluster ─────────────────────────────
    TCEK:  { naac: 'B',   estd: 2004, website: 'https://trinityengg.ac.in' },
    TCTK:  { naac: 'B+',  estd: 2004, website: 'https://trinity.ac.in' },
    PRIW:  { naac: 'B',   estd: 2002, website: 'https://priyadarshinikhm.ac.in' },
    RITW:  { naac: 'B+',  estd: 2009, website: 'https://rishims.ac.in' },
    SAIS:  { naac: 'B',   estd: 2005, website: 'https://saispurti.ac.in' },
    // ── JNTUH Constituent Colleges (Government) ───────────────────────────────
    JNKR:  { naac: 'A',   estd: 2013, website: 'https://jntuh.ac.in' },
    JNTH:  { naac: 'N/A', estd: 1965, website: 'https://jntuh.ac.in' },
    JNMB:  { naac: 'N/A', estd: 2018, website: 'https://jntuh.ac.in' },
    JNPL:  { naac: 'N/A', estd: 2014, website: 'https://jntuh.ac.in' },
    JNTM:  { naac: 'N/A', estd: 2010, website: 'https://jntuh.ac.in' },
    JNTR:  { naac: 'N/A', estd: 2016, website: 'https://jntuh.ac.in' },
    JNTS:  { naac: 'N/A', estd: 2012, website: 'https://jntuh.ac.in' },
    JNTSSF:{ naac: 'N/A', estd: 2012, website: 'https://jntuh.ac.in' },
    JNWN:  { naac: 'N/A', estd: 2022, website: 'https://jntuh.ac.in' },
    KSGI:  { naac: 'N/A', estd: 2015, website: 'https://jntuh.ac.in' },
    // ── University / Specialized Colleges ─────────────────────────────────────
    SUCE:  { naac: 'N/A', estd: 2014, website: 'https://satavahana.ac.in' },
    PUCE:  { naac: 'N/A', estd: 2010, website: 'https://palamuruuniversity.ac.in' },
    TUCE:  { naac: 'N/A', estd: 2008, website: 'https://telanganauniversity.ac.in' },
    JNPASF:{ naac: 'N/A', estd: 2005, website: 'https://jnafau.ac.in' },
    ESUT:  { naac: 'N/A', estd: 2020, website: 'https://esuniv.ac.in' },
    ESUTSF:{ naac: 'N/A', estd: 2020, website: 'https://esuniv.ac.in' },
    CASR:  { naac: 'N/A', estd: 1964, website: 'https://pjtsau.edu.in' },
    CDTK:  { naac: 'N/A', estd: 1964, website: 'https://pvnrtvu.ac.in' },
    CFSR:  { naac: 'N/A', estd: 1969, website: 'https://pjtsau.edu.in' },
    BOSE:  { naac: 'B++', estd: 2008, website: 'https://anubose.ac.in' },
  };
  COLLEGES.forEach(c => {
    const patch = COLLEGE_PATCHES[c.code];
    if (!patch) return;
    if (patch.naac) c.naac = patch.naac;                           // always apply verified grade
    if (patch.estd  && !c.estd) c.estd = patch.estd;
    if (patch.website && !c.website) c.website = patch.website;
  });
}

// ── Prediction Engine Constants ────────────────────────────────
// Per-branch 2026 market factor: < 1.0 = cutoff compresses (harder), > 1.0 = expands (easier)
const MARKET_FACTOR = {
  'CSE': 0.92, 'CSD': 0.94, 'CSM': 0.94, 'AIML': 0.95, 'CIC': 0.95, 'CSO': 0.95, 'IDS': 0.95,
  'IT':  0.98, 'INF': 0.98, 'CSW': 0.98,
  'ECE': 1.05,
  'EEE': 1.15, 'EIE': 1.15, 'ECM': 1.15,
  'MEC': 1.35, 'CIV': 1.30, 'CHE': 1.30, 'MIN': 1.40
};
const NAAC_GRADE_SCORES = { 'A++': 10, 'A+': 8, 'NAAC A+': 8, 'A': 6, 'NAAC A': 6, 'B++': 4, 'B+': 3, 'B': 2 };
const MAX_QUALIFYING_RANK = 120000;
const GOVERNMENT_ADJACENT_TYPES = ['GOV', 'UNIV', 'SF'];

// ── App State ──────────────────────────────────────────────────
const state = {
  rankMode: 'rank',
  studentRank: null,
  studentMarks: null,
  gender: 'BOYS',
  prioritizeWomens: false,
  category: 'OC',
  region: 'OU',
  incomeLevel: 'below', // 'below' | 'above' | 'high'
  tsStudy: true,

  activeTab: 'predictor',
  activeCounselSub: 'timeline',

  searchQuery: '',
  filterBranchCodes: [],      // ordered priority array; [] = all
  filterDistrictList: [],     // [] = all (no priority order)
  filterTypeList: [],         // [] = all
  filterAffiliationList: [],  // [] = all
  filterHostel: false,
  filterNaac: false,
  sortBy: 'recommended',
  viewMode: 'table',  // predictor is always table; cards live in the ranking panel
  rankBuffer: 0,

  compareList: [],
  optionList: [],
  checklist: {},
  preferenceMode: 'college'   // 'college' | 'branch'
};

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  applyUrlParams();

  initSetupWizard(); // must be first — sets window.__wzActive before guide init
  initStatsBar();
  initMobileToggle();
  initTabs();
  initFormBindings();
  initPredictorFilters();
  initSimulator();
  initCounsellingTabs();
  initChecklistAndTimeline();
  initShareAndExport();
  initSyncToOptions();
  initLivePhaseBar();
  initUserGuide();
  initMobileResponsive();

  calculateRankAndReimbursement();
  renderPredictor();
  renderCollegeRanking();
  renderCompare();
  renderChecklist();
  renderTimeline();
  renderDetailedChecklist();
  renderStrategyGuide();
  renderAfterAllotmentGuide();
  renderInfoHub();
  updateCompareBadge();
});

// ── LocalStorage ───────────────────────────────────────────────
function saveStateToStorage() {
  localStorage.setItem('eapcet_state', JSON.stringify({
    optionList: state.optionList,
    checklist: state.checklist
  }));
}

function loadStateFromStorage() {
  const saved = localStorage.getItem('eapcet_state');
  if (saved) {
    try {
      const p = JSON.parse(saved);
      state.optionList = p.optionList || [];
      state.checklist  = p.checklist  || {};
    } catch (e) { /* ignore */ }
  }
}

// ── URL Params (shareable link) ────────────────────────────────
function applyUrlParams() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (params.get('rank')) {
    state.studentRank = parseInt(params.get('rank'), 10);
    const el = document.getElementById('student-rank');
    if (el) el.value = state.studentRank;
  }
  if (params.get('cat'))    { state.category = params.get('cat'); const el = document.getElementById('student-category'); if(el) el.value = state.category; }
  if (params.get('gender')) {
    state.gender = params.get('gender');
    document.querySelectorAll('input[name="gender"]').forEach(r => { r.checked = r.value === state.gender; });
    const womensRow = document.getElementById('womens-prioritize-row');
    if (womensRow) womensRow.style.display = state.gender === 'GIRLS' ? '' : 'none';
  }
  if (params.get('dists'))  { state.filterDistrictList = params.get('dists').split(',').filter(Boolean); }
  if (params.get('brs'))    { state.filterBranchCodes = params.get('brs').split(',').filter(Boolean); }
}

function buildShareUrl() {
  const p = new URLSearchParams();
  if (state.studentRank) p.set('rank', state.studentRank);
  p.set('cat', state.category);
  p.set('gender', state.gender);
  if (state.filterDistrictList.length > 0) p.set('dists', state.filterDistrictList.join(','));
  if (state.filterBranchCodes.length > 0) p.set('brs', state.filterBranchCodes.join(','));
  return `${location.origin}${location.pathname}#${p.toString()}`;
}

// ── Mobile sidebar toggle ──────────────────────────────────────
const TOGGLE_OPEN_HTML  = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const TOGGLE_CLOSE_HTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

function initMobileToggle() {
  const toggle = document.getElementById('sidebar-mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle) return;
  if (window.innerWidth <= 768) toggle.style.display = 'flex';

  toggle.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('sidebar-expanded');
    toggle.innerHTML = isOpen ? TOGGLE_CLOSE_HTML : TOGGLE_OPEN_HTML;
  });

  // Close drawer when tapping outside the sidebar
  document.querySelector('.main-panel')?.addEventListener('click', () => {
    if (sidebar.classList.contains('sidebar-expanded')) {
      sidebar.classList.remove('sidebar-expanded');
      toggle.innerHTML = TOGGLE_OPEN_HTML;
    }
  });

  window.addEventListener('resize', () => {
    toggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
    if (window.innerWidth > 768) {
      sidebar.classList.remove('sidebar-expanded');
      toggle.innerHTML = TOGGLE_OPEN_HTML;
    }
  });
}

// ── Tabs ───────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      state.activeTab = tabName;
      document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
      document.getElementById(`tab-${tabName}`).classList.add('active');
      updateFabBar();
      if (tabName === 'predictor')             { renderPredictor();     trackEvent('predictor_opened'); }
      else if (tabName === 'colleges')         renderCollegeRanking();
      else if (tabName === 'option-simulator') renderSimulator();
      else if (tabName === 'compare')          { renderCompare();        trackEvent('compare_opened'); }
    });
  });
}

// ── Counselling sub-tabs ───────────────────────────────────────
function initCounsellingTabs() {
  document.querySelectorAll('.counselling-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.getAttribute('data-csub');
      state.activeCounselSub = sub;
      document.querySelectorAll('.counselling-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.counselling-sub').forEach(s => s.classList.remove('active'));
      document.getElementById(`csub-${sub}`).classList.add('active');
      if (sub === 'strategy')        renderStrategyGuide();
      if (sub === 'after-allotment') renderAfterAllotmentGuide();
      if (sub === 'info-hub')        renderInfoHub();
    });
  });
  document.getElementById('btn-calc-reimb').addEventListener('click', runFeeCalculator);
}

// ── Profile form ───────────────────────────────────────────────
function initFormBindings() {
  const rankBtn   = document.getElementById('mode-rank-btn');
  const marksBtn  = document.getElementById('mode-marks-btn');
  const rankGroup = document.getElementById('group-rank');
  const marksGroup = document.getElementById('group-marks');

  rankBtn.addEventListener('click', () => {
    state.rankMode = 'rank';
    rankBtn.classList.add('active'); marksBtn.classList.remove('active');
    rankGroup.classList.remove('hidden'); marksGroup.classList.add('hidden');
    calculateRankAndReimbursement(); renderPredictor();
  });
  marksBtn.addEventListener('click', () => {
    state.rankMode = 'marks';
    marksBtn.classList.add('active'); rankBtn.classList.remove('active');
    marksGroup.classList.remove('hidden'); rankGroup.classList.add('hidden');
    calculateRankAndReimbursement(); renderPredictor();
  });

  document.getElementById('student-rank').addEventListener('input', e => {
    state.studentRank = cleanInt(e.target.value);
    calculateRankAndReimbursement(); renderPredictor(); renderStrategyGuide(); renderEligibilityWarning();
    updateMobileProfileBar();
  });
  document.getElementById('student-marks').addEventListener('input', e => {
    state.studentMarks = cleanInt(e.target.value);
    calculateRankAndReimbursement(); renderPredictor(); renderStrategyGuide(); renderEligibilityWarning();
    updateMobileProfileBar();
  });

  document.querySelectorAll('input[name="gender"]').forEach(r => r.addEventListener('change', e => {
    state.gender = e.target.value;
    const womensRow = document.getElementById('womens-prioritize-row');
    if (womensRow) womensRow.style.display = state.gender === 'GIRLS' ? '' : 'none';
    if (state.gender !== 'GIRLS') { state.prioritizeWomens = false; const cb = document.getElementById('prioritize-womens'); if (cb) cb.checked = false; }
    calculateRankAndReimbursement(); renderPredictor(); renderCollegeRanking();
    updateMobileProfileBar();
  }));
  document.getElementById('prioritize-womens')?.addEventListener('change', e => {
    state.prioritizeWomens = e.target.checked; renderPredictor();
  });
  document.querySelectorAll('input[name="income"]').forEach(r => r.addEventListener('change', e => {
    state.incomeLevel = e.target.value; calculateRankAndReimbursement();
    updateMobileProfileBar();
  }));
  document.getElementById('ts-study-record').addEventListener('change', e => {
    state.tsStudy = e.target.checked; calculateRankAndReimbursement();
  });
  document.getElementById('student-category').addEventListener('change', e => {
    state.category = e.target.value; calculateRankAndReimbursement(); renderPredictor(); renderEligibilityWarning(); renderCollegeRanking();
    updateMobileProfileBar();
  });
  document.getElementById('student-region').addEventListener('change', e => {
    state.region = e.target.value; calculateRankAndReimbursement(); renderPredictor();
    updateMobileProfileBar();
  });
}

// ── Marks → Rank Interpolation ────────────────────────────────
// Official 2026 density anchors (June analysis). Linear interpolation between brackets.
const RANK_ANCHORS = [
  { marks: 160, rank:      1 },
  { marks: 140, rank:    500 },
  { marks: 120, rank:   2500 },
  { marks: 100, rank:   6000 },
  { marks:  90, rank:   9500 },
  { marks:  80, rank:  14500 },
  { marks:  70, rank:  24000 },
  { marks:  60, rank:  39000 },
  { marks:  50, rank:  68000 },
  { marks:  40, rank: 110000 }
];

function estimateRank(marks) {
  const m = parseInt(marks) || 0;
  if (m < 40)  return 200000;
  if (m >= 160) return 1;
  for (let i = 0; i < RANK_ANCHORS.length - 1; i++) {
    const hi = RANK_ANCHORS[i], lo = RANK_ANCHORS[i + 1];
    if (m <= hi.marks && m > lo.marks) {
      const t = (m - lo.marks) / (hi.marks - lo.marks);
      return Math.round(lo.rank - t * (lo.rank - hi.rank));
    }
  }
  return RANK_ANCHORS[RANK_ANCHORS.length - 1].rank;
}

// ── Fee Reimbursement (per-college, for card badges) ───────────
function calculateFees(fee, rank, category) {
  if (['SC', 'ST'].some(c => category.includes(c))) {
    return { pay: 0, text: 'Full Waiver (100%)', isFree: true };
  }
  if (rank > 0 && rank <= 10000) {
    return { pay: 0, text: 'Merit Waiver (<10k Rank)', isFree: true };
  }
  const studentPays = Math.max(0, (fee || 0) - 35000);
  return {
    pay: studentPays,
    text: studentPays === 0 ? 'Full Waiver (Low Fee)' : 'Partial (Govt pays ₹35k)',
    isFree: studentPays === 0
  };
}

// ── Rank Prediction & Fee Reimbursement ───────────────────────
function calculateRankAndReimbursement() {
  let rank = state.studentRank;

  if (state.rankMode === 'marks') {
    const marks = state.studentMarks;
    const predBox = document.getElementById('rank-prediction-display');
    const predVal = document.getElementById('predicted-rank-val');
    if (marks !== null && marks !== undefined && marks >= 0) {
      const estimatedRank = estimateRank(marks);
      if (estimatedRank < 200000) {
        rank = estimatedRank;
        state.studentRank = estimatedRank;
        predVal.textContent = `~${estimatedRank.toLocaleString()} (interpolated from ${marks} marks)`;
        predBox.classList.remove('hidden');
        // Auto-populate rank input field if visible
        const rankInput = document.getElementById('student-rank');
        if (rankInput && !rankInput.value) rankInput.value = estimatedRank;
      } else { rank = null; predBox.classList.add('hidden'); }
    } else { rank = null; predBox?.classList.add('hidden'); }
  }

  const badge = document.getElementById('reimbursement-badge');
  const desc  = document.getElementById('reimbursement-desc');
  const { eligible, label, text } = getReimbursementStatus(rank, state.incomeLevel, state.tsStudy, state.category);

  badge.className = `reimb-badge ${eligible === 'full' ? 'eligible' : eligible === 'partial' ? 'eligible' : 'not-eligible'}`;
  badge.innerHTML = `<span>${eligible !== 'none' ? '✔' : '✕'}</span> <span class="text">${label}</span>`;
  desc.textContent = text;
}

function getReimbursementStatus(rank, incomeLevel, tsStudy, category) {
  if (!tsStudy) return { eligible: 'none', label: 'Not Eligible', text: 'Requires 4+ years of study in Telangana.' };
  if (incomeLevel === 'above8' || incomeLevel === 'high') return { eligible: 'none', label: 'Not Eligible', text: 'Family income above ₹8 Lakhs is not eligible for fee reimbursement.' };

  const isGovtCategory = ['SC_I','SC_II','SC_III','ST','BC_A','BC_B','BC_C','BC_D','BC_E'].includes(category);
  const incomeLow = incomeLevel === 'below' || incomeLevel === 'below1' || incomeLevel === 'below2';
  const income2to5 = incomeLevel === '2to5' || incomeLevel === 'above';

  if (rank && rank <= 10000 && incomeLow) return { eligible: 'full', label: 'Eligible (Full)', text: `Rank ${rank.toLocaleString()} qualifies for 100% tuition fee reimbursement in Convener Quota colleges.` };
  if (incomeLow && tsStudy) return { eligible: 'partial', label: 'Eligible (₹35,000/yr)', text: 'Eligible for TS fee reimbursement of ₹35,000/year for private aided colleges, full reimbursement in Government colleges.' };
  if (income2to5 && isGovtCategory) return { eligible: 'partial', label: 'Partial Eligibility', text: 'BC/SC/ST students with family income ₹2–5 Lakhs may be eligible for partial reimbursement. Check with TSSP.' };
  return { eligible: 'none', label: 'Not Eligible', text: 'Current income level does not qualify for Telangana fee reimbursement scheme.' };
}

// ── Fee Calculator (Counselling Tab) ──────────────────────────
function runFeeCalculator() {
  const rank     = cleanInt(document.getElementById('calc-rank').value);
  const category = document.getElementById('calc-category').value;
  const income   = document.getElementById('calc-income').value;
  const colType  = document.getElementById('calc-college-type').value;
  const tsStudy  = document.getElementById('calc-ts-study').checked;

  const container = document.getElementById('calc-result-container');

  if (!rank) {
    container.innerHTML = `<div class="calc-result-panel"><p style="color:var(--reach-color);font-weight:700">Please enter a valid EAPCET rank to calculate.</p></div>`;
    return;
  }

  let eligibleClass = 'ineligible';
  let badgeLabel = '';
  let amountText = '₹0 / year';
  let description = '';
  let conditions = [];

  const lowIncome = ['below1','below2'].includes(income);
  const midIncome = ['2to5','5to8'].includes(income);
  const highIncome = income === 'above8';
  const isSCSTBC = ['SC','ST','BC'].includes(category);

  if (!tsStudy) {
    badgeLabel = 'Not Eligible';
    description = 'Fee reimbursement requires 4+ years of study records in Telangana (Classes 6–12 or equivalent).';
  } else if (highIncome) {
    badgeLabel = 'Not Eligible';
    description = 'Family income above ₹8 Lakhs per year is not eligible for the TS fee reimbursement scheme.';
  } else if (lowIncome && rank <= 10000) {
    eligibleClass = 'eligible';
    badgeLabel = 'Fully Eligible';
    amountText = colType === 'govt' ? 'Full Tuition' : '₹1,15,000 / year';
    description = colType === 'govt'
      ? 'Government college — full tuition fee reimbursed by TS government for your rank and income.'
      : 'Private college Convener quota — reimbursement of ₹1,15,000/year (Engineering, approved colleges).';
    conditions = ['Income certificate (< ₹2L) mandatory', 'Submit at time of admission', 'Renew every academic year'];
  } else if (lowIncome) {
    eligibleClass = 'partial';
    badgeLabel = 'Eligible (Standard)';
    amountText = colType === 'govt' ? 'Full Tuition' : '₹35,000 / year';
    description = colType === 'govt'
      ? 'Government colleges — full fee reimbursed regardless of rank for income below ₹2L.'
      : 'Private Convener quota — standard ₹35,000/year reimbursed by TS government.';
    conditions = ['Income certificate required', 'Caste certificate (if BC/SC/ST)', 'TS study certificate required'];
  } else if (midIncome && isSCSTBC) {
    eligibleClass = 'partial';
    badgeLabel = 'Possible (Check TSSP)';
    amountText = '₹15,000–35,000 / yr';
    description = 'BC/SC/ST students with income ₹2–8L may receive partial reimbursement under TSSP (check latest GO).';
    conditions = ['Income certificate required', 'Category certificate (BC/SC/ST)', 'Verify with TSSP website'];
  } else {
    badgeLabel = 'Not Eligible';
    description = 'Your rank/income/category combination does not currently qualify for TS fee reimbursement.';
  }

  const conditionsHtml = conditions.length
    ? `<div style="margin-top:14px"><div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Required Documents</div>${conditions.map(c => `<div style="font-size:12px;color:var(--text-secondary);padding:4px 0;border-bottom:1px solid var(--border)">✔ ${c}</div>`).join('')}</div>`
    : '';

  // Budget breakdown
  const isGovtCol  = colType === 'govt';
  const tuitionAmt = isGovtCol ? 25000 : (lowIncome && rank <= 10000 ? 115000 : 75000);
  const reimb      = eligibleClass === 'eligible' ? (isGovtCol ? tuitionAmt : Math.min(tuitionAmt, parseInt(amountText.replace(/[^\d]/g,'')) || 0)) : 0;
  const hostelAmt  = 55000;
  const messAmt    = 42000;
  const otherAmt   = 12000;
  const yearlyTotal = tuitionAmt + hostelAmt + messAmt + otherAmt;
  const yearlyNet   = Math.max(0, yearlyTotal - reimb);
  const totalFour   = yearlyNet * 4;

  container.innerHTML = `
    <div class="calc-result-panel">
      <div class="calc-result-badge ${eligibleClass}">${badgeLabel}</div>
      <div class="calc-result-amount">${amountText}</div>
      <div class="calc-result-desc">${description}</div>
      ${conditionsHtml}
      <div class="budget-breakdown-section">
        <div class="budget-title">Estimated Annual Budget (with hostel)</div>
        <div class="budget-row"><span>Tuition Fee (est.)</span><span>₹${tuitionAmt.toLocaleString()}</span></div>
        <div class="budget-row"><span>Hostel Fee (est.)</span><span>₹${hostelAmt.toLocaleString()}</span></div>
        <div class="budget-row"><span>Mess Charges (est.)</span><span>₹${messAmt.toLocaleString()}</span></div>
        <div class="budget-row"><span>Exam/Lab/Library</span><span>₹${otherAmt.toLocaleString()}</span></div>
        ${reimb > 0 ? `<div class="budget-row reimb-row"><span>Fee Reimbursement</span><span>−₹${reimb.toLocaleString()}</span></div>` : ''}
        <div class="budget-row total-row"><span>Your Net Cost / Year</span><span>₹${yearlyNet.toLocaleString()}</span></div>
        <div class="budget-row total-4yr"><span>Approx. 4-Year Total</span><span>₹${totalFour.toLocaleString()}</span></div>
        <p style="font-size:10px;color:var(--text-muted);margin-top:8px">Estimates. Tuition varies by college. Hostel/mess optional. Reimbursement subject to eligibility.</p>
      </div>
      <p style="font-size:10px;color:var(--text-muted);margin-top:14px">Reimbursement: TS G.O. Ms. No. 53, Dt. 28/03/2023. Verify at tssp.ap.gov.in.</p>
    </div>
  `;
}

// ── Phase Strategy Guide ───────────────────────────────────────
function renderStrategyGuide() {
  const container = document.getElementById('strategy-content');
  if (!container) return;
  const rank = state.studentRank;

  if (!rank) {
    container.innerHTML = `<div class="empty-state" style="padding:40px 20px"><svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none" class="empty-icon"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg><p style="font-size:13px">Enter your rank in the sidebar to see personalized strategy</p></div>`;
    return;
  }

  const tier = rank <= 1000 ? 'top' : rank <= 5000 ? 'high' : rank <= 15000 ? 'mid' : rank <= 40000 ? 'average' : rank <= 80000 ? 'low' : 'verylow';

  const advice = {
    top: { phase1: 'You have strong chances at top institutions (CBIT, VNRVJIET, GRIET, UCE-OU). Accept your Phase 1 allotment if you get your target branch.', phase2: 'Only participate in Phase 2 if unsatisfied with Phase 1 — you risk losing a good seat.', final: 'Not recommended unless your Phase 1/2 choices were not met.', spot: 'No need — your rank should get you a seat in Phases 1–2.' },
    high: { phase1: 'Good chances at top private autonomous colleges and a few Government colleges. Enter 40+ quality options.', phase2: 'If Phase 1 gives you a lower-priority option, participate in Phase 2 to try upgrading.', final: 'Consider only if Phase 2 did not meet your expectations.', spot: 'Keep as a backup — unlikely to be needed at your rank.' },
    mid: { phase1: "Target good private colleges (JNTUH/OU affiliated). Enter 60-80 options covering all branches you are open to.", phase2: "Phase 2 cutoffs are usually slightly higher — wait for it if your Phase 1 seat is not satisfactory.", final: "Good opportunity to get a branch upgrade or better college.", spot: "May be useful for premium institutions that have leftover management seats." },
    average: { phase1: 'You can get quality private colleges. Prioritize CS/EC branches. Enter 80–100 options to maximize seat probability.', phase2: 'Highly recommended — cutoffs expand significantly in Phase 2. Participate even if you got a Phase 1 seat, to try for better.', final: 'Definitely participate — Final Phase often opens seats in mid-tier colleges.', spot: 'Attend spot admissions if you did not get a seat in Phases 1–3.' },
    low: { phase1: "Enter all branches you are comfortable with across all districts. Do not be selective at this stage.", phase2: "Critical — most mid-tier college seats fill up by Phase 2. Enter maximum options.", final: "Strongly recommended. Use Final Phase to secure a seat before spot admissions.", spot: "Very important at your rank — attend spot admissions for any remaining options." },
    verylow: { phase1: 'Enter everything you can — lower-ranked private colleges, non-CS branches like EEE/Mech/Civil.', phase2: 'Participate in all phases. Expand to colleges in Warangal, Khammam, Nalgonda districts.', final: 'Final Phase is your best opportunity for a Convener quota seat.', spot: 'Spot admissions are critical at your rank. Prepare physically to attend.' }
  };

  const a = advice[tier];
  const tierLabel = rank <= 1000 ? 'Top Rank' : rank <= 5000 ? 'High Rank' : rank <= 15000 ? 'Mid Rank' : rank <= 40000 ? 'Average Rank' : rank <= 80000 ? 'Lower Rank' : 'Bottom Tier';

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:12px 16px;background:linear-gradient(135deg,var(--primary-bg),var(--secondary-bg));border-radius:var(--radius);border:1px solid rgba(123,63,242,0.15)">
      <div>
        <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase">Your Profile</div>
        <div style="font-size:18px;font-weight:900;color:var(--primary)">Rank #${rank.toLocaleString()} — ${tierLabel}</div>
        <div style="font-size:12px;color:var(--text-secondary)">${state.category} | ${state.gender} | ${state.region === 'OU' ? 'OU Local Area' : 'Non-Local'}</div>
      </div>
    </div>
    <div class="strategy-cards">
      <div class="strategy-card phase1">
        <h4>Phase 1 (July 2026)</h4>
        <p>${a.phase1}</p>
      </div>
      <div class="strategy-card phase2">
        <h4>Phase 2 (Late July 2026)</h4>
        <p>${a.phase2}</p>
      </div>
      <div class="strategy-card final">
        <h4>Final Phase (August 2026)</h4>
        <p>${a.final}</p>
      </div>
      <div class="strategy-card spot">
        <h4>Spot Admissions</h4>
        <p>${a.spot}</p>
      </div>
    </div>
    <div style="margin-top:16px;padding:12px 14px;background:var(--bg-app);border-radius:var(--radius-sm);border:1px solid var(--border);font-size:12px;color:var(--text-secondary);line-height:1.6">
      <strong style="color:var(--text-primary)">Pro Tips for Rank ${rank.toLocaleString()}:</strong>
      ${rank <= 15000
        ? ' ∙ Aim for CS or IT branches in top colleges. ∙ Keep Government colleges high in preference — fee reimbursement applies. ∙ Lock your Phase 1 seat only if it matches your top 3 choices.'
        : rank <= 50000
          ? ' ∙ Be flexible on branch — IT, AIML, ECE are good alternatives. ∙ Geographic flexibility (Warangal, Khammam) significantly expands options. ∙ Consider Phase 2 as your real shot at a good seat.'
          : ' ∙ Consider all branches including EEE, Mech, Civil — good career options. ∙ Expand to all 23 districts. ∙ Don\'t skip any counselling phase — each phase has new seat openings.'}
    </div>
  `;
}

// ── Predictor Filters ──────────────────────────────────────────
function initPredictorFilters() {
  let _searchTrackTimer = null;
  document.getElementById('search-college').addEventListener('input', e => {
    state.searchQuery = e.target.value.toLowerCase();
    renderPredictor();
    if (state.searchQuery.length > 1) {
      clearTimeout(_searchTrackTimer);
      _searchTrackTimer = setTimeout(() => trackEvent('college_searched', { query: state.searchQuery }), 800);
    }
  });
  document.getElementById('filter-hostel').addEventListener('change', e => { state.filterHostel = e.target.checked; renderPredictor(); });
  document.getElementById('filter-naac').addEventListener('change', e => { state.filterNaac = e.target.checked; renderPredictor(); });
  document.getElementById('sort-by').addEventListener('change', e => { state.sortBy = e.target.value; renderPredictor(); });

  const bufferSlider = document.getElementById('rank-buffer');
  const bufferDisplay = document.getElementById('buffer-val-display');

  function updateBufferTrack(val) {
    const pct = ((val + 10000) / 20000) * 100;
    let bg;
    if (val === 0) {
      bg = '#E2E8F0';
    } else if (val > 0) {
      bg = `linear-gradient(to right,#E2E8F0 0%,#E2E8F0 50%,#FF6A2A 50%,#FF6A2A ${pct}%,#E2E8F0 ${pct}%,#E2E8F0 100%)`;
    } else {
      bg = `linear-gradient(to right,#E2E8F0 0%,#E2E8F0 ${pct}%,#7B3FF2 ${pct}%,#7B3FF2 50%,#E2E8F0 50%,#E2E8F0 100%)`;
    }
    bufferSlider.style.setProperty('--buffer-track-bg', bg);
  }

  bufferSlider.addEventListener('input', e => {
    state.rankBuffer = parseInt(e.target.value, 10);
    bufferDisplay.textContent = state.rankBuffer > 0 ? `+${state.rankBuffer.toLocaleString()}` : state.rankBuffer < 0 ? `${state.rankBuffer.toLocaleString()}` : '± 0';
    updateBufferTrack(state.rankBuffer);
    renderPredictor();
  });

  // View-toggle buttons removed — predictor always uses table view.

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    document.getElementById('search-college').value = '';
    document.getElementById('filter-hostel').checked = false;
    document.getElementById('filter-naac').checked = false;
    document.getElementById('sort-by').value = 'recommended';
    document.getElementById('rank-buffer').value = 0;
    document.getElementById('buffer-val-display').textContent = '± 0';
    updateBufferTrack(0);
    Object.assign(state, {
      searchQuery: '', filterBranchCodes: [], filterDistrictList: [],
      filterTypeList: [], filterAffiliationList: [],
      filterHostel: false, filterNaac: false, sortBy: 'recommended', rankBuffer: 0
    });
    updateAllChipsUI();
    renderPredictor();
  });

  // Preference mode toggle
  document.getElementById('btn-pref-college')?.addEventListener('click', () => setPrefMode('college'));
  document.getElementById('btn-pref-branch')?.addEventListener('click',  () => setPrefMode('branch'));

  initMultiSelectFilters();
}

// ── Admission Chance Logic ─────────────────────────────────────

// Returns a multiplier applied to 2025 cutoff to project 2026.
// factor < 1 = cutoff rank falls (more competitive); factor > 1 = opens up.
// isGovt: govt/univ seats are demand-rigid — dampens extreme market swings by 5%.
function getBranchMarketFactor(branchCode, isGovt = false) {
  const factor = MARKET_FACTOR[branchCode] ?? 1.0;
  return isGovt ? factor * 0.95 : factor;
}

function getAdmissionChance(rank, cutoff, buffer = 0, branchCode = null, isGovt = false) {
  if (rank === null || rank === undefined) return { level: 'Enter Rank', class: 'na', tier: 'na', priority: 5 };
  if (!cutoff) return { level: 'Reach', class: 'low', tier: 'reach', priority: 4 };

  const effectiveRank = rank + buffer;
  const factor = branchCode ? getBranchMarketFactor(branchCode, isGovt) : 1.0;
  const est2026 = Math.min(MAX_QUALIFYING_RANK, Math.max(1, Math.round(cutoff * factor)));
  const ratio = effectiveRank / est2026;

  if (ratio <= 0.80) return { level: 'Safe Pick',  class: 'high',   tier: 'safe',       priority: 1 };
  if (ratio <= 1.00) return { level: 'Good Bet',   class: 'medium', tier: 'likely',     priority: 2 };
  if (ratio <= 1.15) return { level: 'Borderline', class: 'dream',  tier: 'borderline', priority: 3 };
  return              { level: 'Reach',             class: 'low',    tier: 'reach',      priority: 4 };
}

// ── 2026 Allotment Probability Predictor ──────────────────────
// Uses 2025 final cutoffs + market demand tier factors to estimate the 2026
// cutoff, then maps the student's rank against that estimate via an S-curve.
function get2026Probability(rank, cutoff2025, branchCode, isGovt = false) {
  if (!rank || !cutoff2025) return null;

  const factor  = getBranchMarketFactor(branchCode, isGovt);
  const est2026 = Math.min(MAX_QUALIFYING_RANK, Math.max(1, Math.round(cutoff2025 * factor)));
  const trendPct = factor - 1; // negative = tightening, positive = expanding
  const ratio   = rank / est2026;

  let probability, label, cls;
  if      (ratio <= 0.75) { probability = 96; label = 'Very High'; cls = 'prob-vh'; }
  else if (ratio <= 0.92) { probability = 88; label = 'Very High'; cls = 'prob-vh'; }
  else if (ratio <= 1.00) { probability = 74; label = 'High';      cls = 'prob-h';  }
  else if (ratio <= 1.09) { probability = 48; label = 'Moderate';  cls = 'prob-m';  }
  else if (ratio <= 1.18) { probability = 22; label = 'Low';       cls = 'prob-l';  }
  else                    { probability =  5; label = 'Unlikely';  cls = 'prob-vl'; }

  return { probability, label, cls, est2026, trendPct };
}

// cutoffHint: pre-resolved branch cutoff from call site; falls back to CSE/best-branch lookup.
// Returns additive score 0-100. GOV/UNIV/SF colleges receive a hard structural advantage.
function getRecommendedScore(college, cutoffHint = null) {
  let score = 0;

  // Factor 1: Government/University structural preference (hard baseline bias)
  score += GOVERNMENT_ADJACENT_TYPES.includes(college.type) ? 40 : 10;

  // Factor 2: Market demand via cutoff rank (revealed-preference prestige signal)
  let refCutoff = cutoffHint;
  if (!refCutoff) {
    const CS_PRIORITY = ['CSE', 'CSD', 'CSI', 'CSC', 'CSM', 'CS'];
    let refBranch = null;
    for (const code of CS_PRIORITY) {
      refBranch = college.branches?.find(b => b.code === code);
      if (refBranch) break;
    }
    if (!refBranch) {
      refBranch = [...(college.branches || [])]
        .filter(b => b.cutoffs?.['OC BOYS'])
        .sort((a, b) => a.cutoffs['OC BOYS'] - b.cutoffs['OC BOYS'])[0] || null;
    }
    refCutoff = refBranch?.cutoffs?.['OC BOYS'] || 0;
  }
  if      (refCutoff <  5000) score += 30;
  else if (refCutoff < 15000) score += 20;
  else if (refCutoff < 40000) score += 10;

  // Factor 3: NAAC accreditation
  const naacGrade = (college.naac || '').trim().toUpperCase();
  if      (naacGrade === 'A++') score += 20;
  else if (naacGrade === 'A+' || naacGrade === 'NAAC A+') score += 15;
  else if (naacGrade === 'A'  || naacGrade === 'NAAC A')  score += 10;
  else if (naacGrade === 'B++') score += 5;

  // Factor 4: Placement consistency — direct LPA value, capped at 15 points
  score += Math.min(parseFloat(college.avg_pkg) || 0, 15);

  return Math.min(100, parseFloat(score.toFixed(2)));
}

function getQualityTier(score) {
  if (score >= 80) return 'elite';
  if (score >= 55) return 'premier';
  if (score >= 30) return 'good';
  return 'standard';
}

// Multi-phase probability for simulator
function getMultiPhaseChance(rank, branch, categoryGenderKey) {
  const pFinal = branch.cutoffs?.[categoryGenderKey];
  const pP1    = branch.cutoffs_p1?.[categoryGenderKey];
  const pP2    = branch.cutoffs_p2?.[categoryGenderKey];

  function pillClass(r, c) {
    if (!c || !r) return 'p-na';
    const ratio = r / c;
    if (ratio <= 0.85) return 'p-high';
    if (ratio <= 1.00) return 'p-medium';
    if (ratio <= 1.15) return 'p-low';
    return 'p-verylow';
  }
  function pillLabel(r, c) {
    if (!c || !r) return 'No data';
    const ratio = r / c;
    if (ratio <= 0.85) return 'High';
    if (ratio <= 1.00) return 'Medium';
    if (ratio <= 1.15) return 'Low';
    return 'Very Low';
  }

  return `
    <div class="pref-prob-bar">
      <div class="prob-phases">
        <span class="prob-label">Phase 1:</span>
        <span class="prob-phase-pill ${pillClass(rank, pP1)}">${pillLabel(rank, pP1)}${pP1 ? ` (${pP1.toLocaleString()})` : ''}</span>
        <span class="prob-label">P2:</span>
        <span class="prob-phase-pill ${pillClass(rank, pP2)}">${pillLabel(rank, pP2)}${pP2 ? ` (${pP2.toLocaleString()})` : ''}</span>
        <span class="prob-label">Final:</span>
        <span class="prob-phase-pill ${pillClass(rank, pFinal)}">${pillLabel(rank, pFinal)}${pFinal ? ` (${pFinal.toLocaleString()})` : ''}</span>
      </div>
    </div>
  `;
}

// Trend arrow comparing phase1 vs final
function getTrendIndicator(branch, categoryGenderKey) {
  const p1 = branch.cutoffs_p1?.[categoryGenderKey];
  const pf = branch.cutoffs?.[categoryGenderKey];
  if (!p1 || !pf) return '';
  const diff = pf - p1;
  if (diff > 1000)   return `<span class="trend-indicator trend-up" title="Cutoff went UP (harder): Phase1=${p1.toLocaleString()}, Final=${pf.toLocaleString()}">↑</span>`;
  if (diff < -1000)  return `<span class="trend-indicator trend-down" title="Cutoff went DOWN (easier): Phase1=${p1.toLocaleString()}, Final=${pf.toLocaleString()}">↓</span>`;
  return `<span class="trend-indicator trend-flat" title="Cutoff stable: Phase1=${p1.toLocaleString()}, Final=${pf.toLocaleString()}">→</span>`;
}

// ── Predictor Renderer ─────────────────────────────────────────
function getCgKey() {
  const genderKey = state.gender === 'GENERAL' ? 'BOYS' : state.gender;
  return `${state.category} ${genderKey}`;
}

// ── College Rankings Panel ─────────────────────────────────────
// Shows ALL colleges ranked by recommendedScore, independent of student rank.
// Re-renders when gender or category changes (affects filtering / score context).
function renderCollegeRanking() {
  const container = document.getElementById('college-ranking-container');
  if (!container) return;

  const genderKey = state.gender === 'GENERAL' ? 'BOYS' : state.gender;

  // Score every college (no rank filter)
  const ranked = COLLEGES
    .filter(c => !(state.gender === 'BOYS' && c.coed === 'GIRLS'))
    .map(c => ({ c, score: getRecommendedScore(c), tier: '' }))
    .sort((a, b) => b.score - a.score);

  container.innerHTML = '';

  ranked.forEach(({ c, score }, idx) => {
    const tier = getQualityTier(score);
    const typeIsGovt = GOVERNMENT_ADJACENT_TYPES.includes(c.type);
    const naacBadge = (c.naac && c.naac !== 'N/A')
      ? `<span class="tag-badge naac" style="font-size:8px;padding:1px 5px">NAAC ${c.naac}</span>` : '';
    const typeBadge = `<span class="tag-badge ${typeIsGovt ? 'govt' : 'pvt'}" style="font-size:8px;padding:1px 5px">${c.type}</span>`;
    const nirfBadge = c.nirf_band
      ? `<span class="tag-badge nirf-band" style="font-size:8px;padding:1px 5px">NIRF ${c.nirf_band}</span>` : '';
    const pkgText = c.avg_pkg ? `${c.avg_pkg} LPA` : '—';
    const feeText = c.fee_1yr ? `₹${Math.round(c.fee_1yr / 1000)}k/yr` : '—';
    const tierClass = tier === 'elite' ? 'ranking-score-elite' : tier === 'premier' ? 'ranking-score-premier' : 'ranking-score-good';

    const inCompare = state.compareList.includes(c.code);
    const card = document.createElement('div');
    card.className = 'ranking-card';
    card.title = `Click to view details`;
    card.innerHTML = `
      <div class="ranking-card-rank">#${idx + 1}</div>
      <div class="ranking-card-body">
        <div class="ranking-card-name">${c.name}</div>
        <div class="ranking-card-meta">${c.code} · ${c.district} · Pkg: ${pkgText} · Fee: ${feeText}</div>
        <div class="ranking-card-badges">${typeBadge}${naacBadge}${nirfBadge}</div>
        <button type="button" class="ranking-compare-btn${inCompare ? ' active' : ''}" data-ranking-compare="${c.code}">
          <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M16 3h5v5M8 21H3v-5M21 3L12 12M3 21l9-9"/></svg>
          ${inCompare ? 'Remove' : 'Compare'}
        </button>
      </div>
      <div class="ranking-card-score ${tierClass}">${score}</div>
    `;
    card.addEventListener('click', () => openCollegeModal(c.code));
    card.querySelector('.ranking-compare-btn').addEventListener('click', e => {
      e.stopPropagation();
      toggleCompare(c.code);
    });
    container.appendChild(card);
  });
}

let _lastTrackedRank = null;
function renderPredictor() {
  const container  = document.getElementById('predictions-container');
  const countText  = document.getElementById('matching-counts');
  container.innerHTML = '';

  const rank   = state.studentRank;
  const buffer = state.rankBuffer;
  const cgKey  = getCgKey();

  // Track unique rank entries as predictions
  if (rank && rank !== _lastTrackedRank) {
    _lastTrackedRank = rank;
    track('predictions');
  }

  const filteredColleges = COLLEGES.map(c => {
    if (state.searchQuery) {
      const q = state.searchQuery;
      if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q) &&
          !c.place.toLowerCase().includes(q) && !(c.district||'').toLowerCase().includes(q)) return null;
    }
    if (state.filterDistrictList.length > 0 && !state.filterDistrictList.includes(c.district)) return null;
    if (state.filterTypeList.length > 0) {
      const typeMatch = state.filterTypeList.some(t => {
        if (t === 'GOV')    return c.type.includes('GOV') || c.type.includes('UNIV');
        if (t === 'PVT')    return c.type.includes('PVT');
        if (t === 'Deemed') return c.type.includes('Deemed');
        return false;
      });
      if (!typeMatch) return null;
    }
    if (state.filterAffiliationList.length > 0 && !state.filterAffiliationList.some(a => c.affiliation.includes(a))) return null;
    if (state.gender === 'BOYS' && c.coed === 'GIRLS') return null;
    if (state.filterHostel && c.hostel !== 'Yes') return null;
    if (state.filterNaac && !c.naac.includes('A')) return null;

    const isGovtPriority = GOVERNMENT_ADJACENT_TYPES.includes(c.type);

    const matchedBranches = c.branches.filter(b => {
      if (state.filterBranchCodes.length === 0) return true;
      return state.filterBranchCodes.includes(b.code);
    }).map(b => {
      const cutoff  = b.cutoffs[cgKey];
      const chance  = getAdmissionChance(rank, cutoff, buffer, b.code, isGovtPriority);
      const trend   = getTrendIndicator(b, cgKey);
      const prob2026 = get2026Probability(rank, cutoff, b.code, isGovtPriority);
      return { ...b, cutoff, chance, trend, prob2026 };
    });

    if (matchedBranches.length === 0) return null;
    const bestPriority = Math.min(...matchedBranches.map(b => b.chance.priority));
    const bestCutoff = Math.min(...matchedBranches.map(b => b.cutoff || 999999));
    const recScore = getRecommendedScore(c, bestCutoff < 999999 ? bestCutoff : null);
    const financials = calculateFees(c.fee_1yr, rank, cgKey);
    return { ...c, branches: matchedBranches, bestChancePriority: bestPriority, recommendedScore: recScore, qualityTier: getQualityTier(recScore), isGovtPriority, financials };
  }).filter(Boolean);

  // Sort
  filteredColleges.sort((a, b) => {
    if (state.sortBy === 'recommended') {
      // Branch First: Reach → Borderline → Good Bet → Safe Pick
      // Mirrors real counseling option-entry order — system allocates best seat from top down
      if (state.preferenceMode === 'branch') {
        if (a.bestChancePriority !== b.bestChancePriority) return b.bestChancePriority - a.bestChancePriority;
        return b.recommendedScore - a.recommendedScore;
      }
      return b.recommendedScore - a.recommendedScore;
    }
    if (state.sortBy === 'chance') {
      if (a.bestChancePriority !== b.bestChancePriority) return a.bestChancePriority - b.bestChancePriority;
      if (a.isGovtPriority !== b.isGovtPriority) return a.isGovtPriority ? -1 : 1; // GOV/UNIV/SF before PVT
      return b.recommendedScore - a.recommendedScore;
    }
    if (state.sortBy === 'fee')      return (a.fee_1yr||999999) - (b.fee_1yr||999999);
    if (state.sortBy === 'package')  return (b.avg_pkg||0) - (a.avg_pkg||0);
    if (state.sortBy === 'naac') {
      const gr = {"A++":6,"A+":5,"NAAC A+":5,"A":4,"NAAC A":4,"B++":3,"B+":2,"B":1,"N/A":0};
      return (gr[b.naac]||0) - (gr[a.naac]||0);
    }
    if (state.sortBy === 'estd')   return (a.estd||9999) - (b.estd||9999);
    if (state.sortBy === 'cutoff') return Math.min(...a.branches.map(b=>b.cutoff||999999)) - Math.min(...b.branches.map(b=>b.cutoff||999999));
    return 0;
  });

  const matchCount  = filteredColleges.reduce((s,c) => s + c.branches.length, 0);
  const splitActive = state.filterBranchCodes.length > 0;
  const useSplitView = splitActive && state.preferenceMode === 'branch';

  const modeTag = state.preferenceMode === 'college'
    ? ` · <strong style="color:var(--primary)">🏛 College First</strong>`
    : ` · <strong style="color:var(--secondary)">📚 Branch First</strong>`;
  const reachFirstNote = (state.preferenceMode === 'branch' && state.sortBy === 'recommended')
    ? ` · <span style="color:var(--text-muted);font-size:11px">Reach → Safe (option entry order)</span>`
    : '';
  const label = useSplitView
    ? `Showing ${matchCount} options — split by branch priority${modeTag}${reachFirstNote}`
    : `Showing ${matchCount} options across ${filteredColleges.length} colleges${modeTag}${reachFirstNote}`;
  countText.innerHTML = label;

  // caution message — hide in branch-first split, show otherwise (unless branch filter set)
  const cautionMsg = document.getElementById('branch-caution-msg');
  if (cautionMsg) cautionMsg.style.display = (splitActive) ? 'none' : '';

  if (filteredColleges.length === 0) {
    container.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" class="empty-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>No Colleges Match Your Filters</p><p class="sub-text">Try adjusting filters, clearing checkboxes, or entering a different rank.</p></div>`;
    return;
  }

  // Predictor always renders as table. Branch-first split gets its own table layout.
  if (useSplitView) {
    renderSplitBranchTableView(container, filteredColleges, cgKey);
  } else {
    renderTableView(container, filteredColleges, cgKey);
  }
}

function renderTableView(container, colleges, cgKey) {
  const wrap = document.createElement('div');
  wrap.className = 'predictions-table-wrap';
  const table = document.createElement('table');
  table.className = 'predictions-table';
  table.innerHTML = `<thead><tr>
    <th>#</th><th>College</th><th>Branch</th><th>Cutoff (Final)</th><th>P1</th><th>P2</th>
    <th>Chance</th><th>2026 Est.</th><th>Fee/yr</th><th>Avg Pkg</th><th></th>
  </tr></thead>`;
  const tbody = document.createElement('tbody');
  let row = 0;
  colleges.forEach(c => {
    c.branches.forEach(b => {
      row++;
      const p1 = b.cutoffs_p1?.[cgKey];
      const p2 = b.cutoffs_p2?.[cgKey];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color:var(--text-muted);font-size:11px">${row}</td>
        <td><div class="table-college-name">${c.name}</div><div style="font-size:10px;color:var(--text-muted)">${c.code} · ${c.district}</div></td>
        <td><div class="table-branch-name">${b.code}</div><div style="font-size:10px;color:var(--text-muted)">${b.name}</div></td>
        <td style="font-weight:700">${b.cutoff ? b.cutoff.toLocaleString() : 'N/A'} ${b.trend}</td>
        <td style="font-size:11px;color:var(--text-muted)">${p1 ? p1.toLocaleString() : '—'}</td>
        <td style="font-size:11px;color:var(--text-muted)">${p2 ? p2.toLocaleString() : '—'}</td>
        <td><span class="chance-pill ${b.chance.class}">${b.chance.level}</span></td>
        <td>${b.prob2026 ? `<span class="prob-2026 ${b.prob2026.cls}" title="Est. 2026 cutoff: ~${b.prob2026.est2026.toLocaleString()}">${b.prob2026.probability}% · ${b.prob2026.label}</span>` : '<span style="color:var(--text-muted);font-size:11px">—</span>'}</td>
        <td style="font-size:12px">${c.fee_1yr ? '₹'+c.fee_1yr.toLocaleString() : 'N/A'}</td>
        <td style="font-size:12px;font-weight:700;color:var(--safe-color)">${c.avg_pkg ? c.avg_pkg+' LPA' : 'N/A'}</td>
        <td><button class="btn btn-secondary btn-sm" style="white-space:nowrap" data-code="${c.code}">Details</button></td>
      `;
      tr.querySelector('button').addEventListener('click', () => openCollegeModal(c.code));
      tbody.appendChild(tr);
    });
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  container.appendChild(wrap);
}

function renderCardView(container, colleges) {
  if (state.sortBy === 'recommended') {
    return renderQualityCardView(container, colleges);
  }

  const TIERS = [
    { key: 'safe',       label: '🟢 Safe Picks',   desc: 'Your rank is well above the cutoff — very high chance of getting this seat.' },
    { key: 'likely',     label: '🔵 Good Bets',     desc: 'Your rank is at or near the cutoff — strong probability of admission.' },
    { key: 'borderline', label: '🟡 Borderline',    desc: 'Rank is slightly above cutoff — possible with buffer or in later phases.' },
    { key: 'reach',      label: '🔴 Reach',         desc: 'Cutoff is well below your rank — unlikely unless cutoffs ease in later phases.' },
  ];

  // Group by tier
  const groups = {};
  TIERS.forEach(t => { groups[t.key] = []; });
  colleges.forEach(c => {
    // Place college in its best branch's tier
    const bestTier = c.branches.reduce((bt, b) => {
      const tierOrder = {safe:0,likely:1,borderline:2,reach:3};
      const bt2 = b.chance?.tier || 'reach';
      return (tierOrder[bt2] < tierOrder[bt]) ? bt2 : bt;
    }, 'reach');
    groups[bestTier].push(c);
  });

  TIERS.forEach(tierInfo => {
    let group = groups[tierInfo.key];
    if (group.length === 0) return;
    if (state.prioritizeWomens) group = [...group].sort((a, b) => (a.coed === 'GIRLS' ? -1 : b.coed === 'GIRLS' ? 1 : 0));

    const section = document.createElement('div');
    section.className = 'tier-section';

    const header = document.createElement('div');
    header.className = `tier-section-header ${tierInfo.key}`;
    header.innerHTML = `
      <span class="tier-title">${tierInfo.label}</span>
      <span class="tier-count">${group.length} college${group.length>1?'s':''}</span>
      <span class="tier-desc">${tierInfo.desc}</span>
      <span class="tier-toggle-icon">▾</span>
    `;
    let collapsed = false;
    header.addEventListener('click', () => {
      collapsed = !collapsed;
      grid.style.display = collapsed ? 'none' : '';
      header.querySelector('.tier-toggle-icon').textContent = collapsed ? '▸' : '▾';
    });

    const grid = document.createElement('div');
    grid.className = 'tier-cards-grid';

    group.forEach(c => {
      const card = buildCollegeCard(c);
      grid.appendChild(card);
    });

    section.appendChild(header);
    section.appendChild(grid);
    container.appendChild(section);
  });
}

function renderQualityCardView(container, colleges) {
  const TIERS = [
    { key: 'elite',    label: '⭐ Elite Institutions', desc: 'Highest-demand colleges — very competitive CSE cutoffs, strong placements, NAAC/NIRF recognition.' },
    { key: 'premier',  label: '🥇 Premier Colleges',   desc: 'Sought-after autonomous colleges with competitive cutoffs, good placement records and NAAC accreditation.' },
    { key: 'good',     label: '🥈 Good Colleges',      desc: 'NAAC-accredited colleges with moderate cutoff competition — solid choice for most students.' },
    { key: 'standard', label: '🥉 Standard Colleges',  desc: 'Affiliated colleges with open cutoffs — good entry point, especially for higher ranks or non-CS branches.' },
  ];

  const groups = { elite: [], premier: [], good: [], standard: [] };
  colleges.forEach(c => { groups[c.qualityTier || 'standard'].push(c); });

  let overallRank = 0;

  TIERS.forEach(tierInfo => {
    let group = groups[tierInfo.key];
    if (group.length === 0) return;
    if (state.prioritizeWomens) group = [...group].sort((a, b) => (a.coed === 'GIRLS' ? -1 : b.coed === 'GIRLS' ? 1 : 0));

    const section = document.createElement('div');
    section.className = 'tier-section';

    const header = document.createElement('div');
    header.className = `tier-section-header ${tierInfo.key}`;
    header.innerHTML = `
      <span class="tier-title">${tierInfo.label}</span>
      <span class="tier-count">${group.length} college${group.length > 1 ? 's' : ''}</span>
      <span class="tier-desc">${tierInfo.desc}</span>
      <span class="tier-toggle-icon">▾</span>
    `;
    let collapsed = false;
    header.addEventListener('click', () => {
      collapsed = !collapsed;
      grid.style.display = collapsed ? 'none' : '';
      header.querySelector('.tier-toggle-icon').textContent = collapsed ? '▸' : '▾';
    });

    const grid = document.createElement('div');
    grid.className = 'tier-cards-grid';
    group.forEach(c => { overallRank++; grid.appendChild(buildCollegeCard(c, overallRank)); });

    section.appendChild(header);
    section.appendChild(grid);
    container.appendChild(section);
  });
}

function buildCollegeCard(c, rank = null) {
  const card = document.createElement('div');
  const bestTier = c.branches[0]?.chance?.tier || 'reach';
  card.className = `college-card glass-panel tier-${bestTier}${c.isGovtPriority ? ' govt-priority-card' : ''}`;

  const inCompare = state.compareList.includes(c.code);
  const feeStr = c.fee_1yr ? `₹${c.fee_1yr.toLocaleString()}/yr` : 'N/A';
  const avgStr = c.avg_pkg ? `${c.avg_pkg} LPA` : 'N/A';
  const highStr = c.highest_pkg ? `${c.highest_pkg} LPA` : 'N/A';

  let badgesHtml = `<span class="tag-badge ${c.type.toLowerCase().includes('gov')?'govt':'pvt'}">${c.type}</span>`;
  if (c.naac && c.naac !== 'N/A') badgesHtml += `<span class="tag-badge naac">NAAC ${c.naac}</span>`;
  if (c.nirf_band) badgesHtml += `<span class="tag-badge nirf-band">NIRF ${c.nirf_band}</span>`;
  if (c.hostel === 'Yes') badgesHtml += `<span class="tag-badge hostel">Hostel</span>`;
  if (c.financials?.isFree) {
    badgesHtml += `<span class="tag-badge fee-free">✅ ZERO FEE</span>`;
  } else if (c.financials?.pay > 0) {
    badgesHtml += `<span class="tag-badge fee-pay">⚠️ You Pay ₹${c.financials.pay.toLocaleString()}</span>`;
  }

  const displayBranches = c.branches.slice(0, 4);
  let branchesHtml = displayBranches.map(b => `
    <div class="branch-row">
      <div class="branch-info">
        <span class="b-code">${b.code}</span>
        <span class="b-name" title="${b.name}">${b.name}</span>
      </div>
      <div class="branch-chance-wrapper">
        <span class="b-cutoff">${b.cutoff ? b.cutoff.toLocaleString() : 'N/A'}</span>
        ${b.trend || ''}
        <span class="chance-pill ${b.chance.class}">${b.chance.level}</span>
        ${b.prob2026 ? `<span class="prob-2026 ${b.prob2026.cls}" title="2026 prediction: Based on 2025 cutoff (${b.cutoff?.toLocaleString()}) + estimated ${Math.round(b.prob2026.trendPct*100)}% YoY shift → est. 2026 cutoff ~${b.prob2026.est2026.toLocaleString()}">${b.prob2026.probability}% · ${b.prob2026.label}</span>` : ''}
      </div>
    </div>
  `).join('');

  if (c.branches.length > 4) {
    branchesHtml += `<div class="branch-row" style="justify-content:center;padding-top:6px"><a href="#" class="view-more-branches" style="color:var(--secondary);font-size:11px;font-weight:700;text-decoration:none" data-code="${c.code}">+ ${c.branches.length - 4} more branches</a></div>`;
  }

  card.innerHTML = `
    <div class="card-glow-edge"></div>
    <div class="card-header-row">
      <div class="college-title-box">
        <div class="college-code-rank-row">
          <span class="college-code-badge">${c.code}</span>
          ${rank ? `<span class="college-app-rank">#${rank}</span>` : ''}
        </div>
        <h4 class="college-name">${c.name}</h4>
        <p class="college-meta-loc">${c.place}, ${c.district} · ${c.affiliation}</p>
      </div>
      <button type="button" class="${inCompare?'btn-icon-only active':'btn-icon-only'}" title="Compare" data-compare-code="${c.code}">
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.5" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
      </button>
    </div>
    <div class="college-badges-row">${badgesHtml}</div>
    <div class="college-stats-panel">
      <div class="stat-box">
        <span class="label">Tuition Fee</span>
        <span class="val">${feeStr}</span>
      </div>
      <div class="stat-box">
        <span class="label">Avg Package</span>
        <span class="val" style="color:var(--safe-color)">${avgStr}</span>
        <span class="sub-val">Highest: ${highStr}</span>
      </div>
    </div>
    <div class="card-branches-table">
      <div class="card-branches-header"><span>Branch</span><span>Cutoff / Chance</span></div>
      ${branchesHtml}
    </div>
    <div class="card-footer-buttons">
      <button type="button" class="btn btn-secondary btn-sm btn-detail" data-code="${c.code}">Full Details</button>
      <button type="button" class="btn btn-sm btn-compare-card${inCompare ? ' active' : ''}" data-compare-code="${c.code}">
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M16 3h5v5M8 21H3v-5M21 3L12 12M3 21l9-9"/></svg>
        ${inCompare ? 'Remove' : 'Compare'}
      </button>
      <button type="button" class="btn btn-primary btn-sm btn-add-pref-multi" data-code="${c.code}">
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M12 5v14M5 12h14"/></svg> Add Options
      </button>
    </div>
  `;

  card.querySelectorAll('[data-compare-code]').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); toggleCompare(c.code); })
  );
  card.querySelector('.btn-detail').addEventListener('click', () => openCollegeModal(c.code));
  const viewMore = card.querySelector('.view-more-branches');
  if (viewMore) viewMore.addEventListener('click', e => { e.preventDefault(); openCollegeModal(c.code); });
  card.querySelector('.btn-add-pref-multi').addEventListener('click', () => addCollegeBranchesToOptions(c.code));

  return card;
}

// ── Compare ────────────────────────────────────────────────────
function toggleCompare(code) {
  const idx = state.compareList.indexOf(code);
  if (idx > -1) state.compareList.splice(idx, 1);
  else {
    if (state.compareList.length >= 4) { alert('You can compare up to 4 colleges.'); return; }
    state.compareList.push(code);
  }
  updateCompareBadge(); renderPredictor(); syncRankingCompareButtons();
}

function syncRankingCompareButtons() {
  document.querySelectorAll('[data-ranking-compare]').forEach(btn => {
    const code = btn.getAttribute('data-ranking-compare');
    const inList = state.compareList.includes(code);
    btn.classList.toggle('active', inList);
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M16 3h5v5M8 21H3v-5M21 3L12 12M3 21l9-9"/></svg> ${inList ? 'Remove' : 'Compare'}`;
  });
}

function updateCompareBadge() {
  document.getElementById('compare-badge').textContent = state.compareList.length;
}

function renderCompare() {
  const container = document.getElementById('compare-view-container');
  container.innerHTML = '';
  if (state.compareList.length === 0) {
    container.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" class="empty-icon"><path d="M16 3h5v5M8 21H3v-5M21 3L12 12M3 21l9-9"/></svg><p>Compare List is Empty</p><p class="sub-text">Click the compare icon on college cards to add up to 4 colleges here.</p></div>`;
    return;
  }
  const cols = COLLEGES.filter(c => state.compareList.includes(c.code));

  const COMPARE_ROWS = [
    { label: 'Location',    fmt: c => `${c.place}, ${c.district}` },
    { label: 'Type',        fmt: c => c.type },
    { label: 'Affiliation', fmt: c => c.affiliation },
    { label: 'NAAC',        fmt: c => c.naac || 'N/A' },
    { label: 'Estd.',       fmt: c => c.estd || 'N/A' },
    { label: 'Hostel',      fmt: c => c.hostel || 'N/A' },
    { label: '1-Yr Fee',    fmt: c => c.fee_1yr   ? `₹${c.fee_1yr.toLocaleString()}`   : 'N/A' },
    { label: 'Total Fee',   fmt: c => c.fee_total  ? `₹${c.fee_total.toLocaleString()}`  : 'N/A' },
    { label: 'Avg Pkg',     fmt: c => c.avg_pkg    ? `${c.avg_pkg} LPA`    : 'N/A' },
    { label: 'Top Pkg',     fmt: c => c.highest_pkg ? `${c.highest_pkg} LPA` : 'N/A' },
    { label: 'Recruiters',  fmt: c => c.recruiters || 'N/A' },
    { label: 'Branches',    fmt: c => c.branches.map(b => b.code).sort().join(', ') },
  ];

  if (window.innerWidth <= 768) {
    // ── Mobile: swipeable card-per-college view ──────────────────
    const wrap = document.createElement('div');
    wrap.className = 'compare-mobile-wrap';

    if (cols.length > 1) {
      const hint = document.createElement('p');
      hint.className = 'compare-swipe-hint';
      hint.innerHTML = '<span class="compare-swipe-arrow">←</span> Swipe to compare <span class="compare-swipe-arrow">→</span>';
      wrap.appendChild(hint);
    }

    const scroll = document.createElement('div');
    scroll.className = 'compare-cards-scroll';

    cols.forEach(c => {
      const card = document.createElement('div');
      card.className = 'compare-card-mobile';

      let html = `
        <div class="ccm-header">
          <div class="ccm-name">${c.name}</div>
          <span class="ccm-code">${c.code}</span>
        </div>`;

      COMPARE_ROWS.forEach(r => {
        html += `<div class="ccm-row">
          <span class="ccm-label">${r.label}</span>
          <span class="ccm-val">${r.fmt(c)}</span>
        </div>`;
      });

      html += `<button type="button" class="ccm-remove" data-remove-code="${c.code}">Remove</button>`;
      card.innerHTML = html;
      scroll.appendChild(card);
    });

    wrap.appendChild(scroll);
    container.appendChild(wrap);

    wrap.querySelectorAll('[data-remove-code]').forEach(btn =>
      btn.addEventListener('click', () => { toggleCompare(btn.getAttribute('data-remove-code')); renderCompare(); })
    );
  } else {
    // ── Desktop / Tablet: comparison table ───────────────────────
    const table = document.createElement('table');
    table.className = 'compare-table';

    let headHtml = '<tr><th>Feature</th>';
    cols.forEach(c => {
      headHtml += `<th class="college-header"><span class="college-code-badge">${c.code}</span><div style="margin-top:4px;font-size:12px">${c.name}</div><button type="button" class="remove-comp-btn" data-remove-code="${c.code}">Remove</button></th>`;
    });
    headHtml += '</tr>';

    let bodyHtml = '';
    COMPARE_ROWS.forEach(r => {
      bodyHtml += `<tr><td style="font-weight:700;white-space:nowrap">${r.label}</td>`;
      cols.forEach(c => { bodyHtml += `<td>${r.fmt(c)}</td>`; });
      bodyHtml += '</tr>';
    });

    table.innerHTML = headHtml + bodyHtml;
    container.appendChild(table);

    table.querySelectorAll('[data-remove-code]').forEach(btn =>
      btn.addEventListener('click', () => { toggleCompare(btn.getAttribute('data-remove-code')); renderCompare(); })
    );
  }
}

// ── Option Form Simulator ──────────────────────────────────────
function initSimulator() {
  const branchSelect = document.getElementById('sim-branch-filter');
  Object.values(BRANCH_REF).sort((a,b) => a.code.localeCompare(b.code)).forEach(b => {
    const opt = document.createElement('option'); opt.value = b.code; opt.textContent = `${b.code} – ${b.name}`; branchSelect.appendChild(opt);
  });
  document.getElementById('sim-search-input').addEventListener('input', renderSimulatorAvailable);
  branchSelect.addEventListener('change', renderSimulatorAvailable);

  // "Show All" clears predictor filters and re-renders
  document.getElementById('btn-sim-clear-filters')?.addEventListener('click', () => {
    state.filterBranchCodes    = [];
    state.filterDistrictList   = [];
    state.filterTypeList       = [];
    state.filterAffiliationList = [];
    updateAllChipsUI();
    renderSimulatorAvailable();
  });
  document.getElementById('btn-clear-pref').addEventListener('click', () => {
    if (confirm('Clear all preference options?')) { state.optionList = []; saveStateToStorage(); renderSimulator(); }
  });
  document.getElementById('btn-simulate-allotment').addEventListener('click', runAllotmentSimulation);
  document.getElementById('btn-close-allotment').addEventListener('click', () => document.getElementById('allotment-modal').classList.remove('open'));
  document.getElementById('btn-print-options').addEventListener('click', printOptionForm);
  document.getElementById('btn-wa-share-options').addEventListener('click', shareOptionFormWhatsApp);
}

function addCollegeBranchesToOptions(collegeCode) {
  const college = COLLEGES.find(c => c.code === collegeCode);
  if (!college) return;
  const cgKey = getCgKey();
  const sorted = [...college.branches].sort((a, b) => (a.cutoffs[cgKey]||999999) - (b.cutoffs[cgKey]||999999));
  let added = 0;
  sorted.forEach(b => {
    if (!state.optionList.some(o => o.collegeCode === collegeCode && o.branchCode === b.code)) {
      state.optionList.push({ collegeCode, branchCode: b.code }); added++;
    }
  });
  saveStateToStorage();
  if (added > 0) alert(`Added ${added} branch(es) of ${collegeCode} to your option form.`);
  else alert(`All branches of ${collegeCode} are already in your option form.`);
}

function renderSimulator() { renderSimulatorAvailable(); renderSimulatorPreferences(); }

function renderSimulatorAvailable() {
  const container = document.getElementById('sim-available-container');
  container.innerHTML = '';
  const search  = document.getElementById('sim-search-input').value.toLowerCase();
  const bFilter = document.getElementById('sim-branch-filter').value;

  // Check if predictor filters are active
  const predBranches = state.filterBranchCodes;
  const predDistricts = state.filterDistrictList;
  const predTypes = state.filterTypeList;
  const predAffil = state.filterAffiliationList;
  const hasPredFilter = predBranches.length > 0 || predDistricts.length > 0 || predTypes.length > 0 || predAffil.length > 0;

  // Update the notice banner
  const notice = document.getElementById('sim-filter-notice');
  const noticeText = document.getElementById('sim-filter-notice-text');
  if (notice) {
    if (hasPredFilter) {
      const parts = [];
      if (predBranches.length > 0)  parts.push(`${predBranches.length} branch${predBranches.length > 1 ? 'es' : ''}: ${predBranches.join(', ')}`);
      if (predDistricts.length > 0) parts.push(`${predDistricts.length} district${predDistricts.length > 1 ? 's' : ''}`);
      if (predTypes.length > 0)     parts.push(`${predTypes.join('/')}`);
      if (predAffil.length > 0)     parts.push(`${predAffil.join('/')}`);
      noticeText.textContent = `Filtered by predictor: ${parts.join(' · ')}`;
      notice.style.display = 'flex';
    } else {
      notice.style.display = 'none';
    }
  }

  const list = [];
  COLLEGES.forEach(c => {
    // Apply predictor filters to mirror what the predictor is showing
    if (predDistricts.length > 0 && !predDistricts.includes(c.district)) return;
    if (predTypes.length > 0) {
      const ok = predTypes.some(t => {
        if (t === 'GOV')    return c.type.includes('GOV') || c.type.includes('UNIV');
        if (t === 'PVT')    return c.type.includes('PVT');
        if (t === 'Deemed') return c.type.includes('Deemed');
        return false;
      });
      if (!ok) return;
    }
    if (predAffil.length > 0 && !predAffil.some(a => c.affiliation.includes(a))) return;

    c.branches.forEach(b => {
      // Apply predictor branch filter
      if (predBranches.length > 0 && !predBranches.includes(b.code)) return;
      // Apply simulator's own search + branch dropdown
      const matchSearch = c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search) ||
                          b.code.toLowerCase().includes(search) || b.name.toLowerCase().includes(search);
      const matchBranch = bFilter === 'all' || b.code === bFilter;
      if (matchSearch && matchBranch) {
        list.push({ collegeCode: c.code, collegeName: c.name, branchCode: b.code, branchName: b.name, district: c.district });
      }
    });
  });

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:20px"><p style="font-size:13px">No options match${hasPredFilter ? ' (predictor filters active)' : ''}.</p></div>`;
    return;
  }

  const display = list.slice(0, 200);
  const overflow = list.length - display.length;

  display.forEach(item => {
    if (state.optionList.some(o => o.collegeCode === item.collegeCode && o.branchCode === item.branchCode)) return;
    const card = document.createElement('div');
    card.className = 'sim-choice-card';
    card.innerHTML = `
      <div class="sim-choice-info">
        <div class="sim-choice-header">
          <span class="b-code">${item.branchCode}</span>
          <span class="sim-choice-title">${item.collegeCode} – ${item.collegeName}</span>
        </div>
        <div class="sim-choice-sub">${item.branchName}</div>
        <div class="sim-choice-meta"><span class="sim-choice-badge">${item.district}</span></div>
      </div>
      <button type="button" class="btn-add-choice" title="Add to option form">+</button>
    `;
    card.querySelector('.btn-add-choice').addEventListener('click', () => {
      const wasEmpty = state.optionList.length === 0;
      state.optionList.push({ collegeCode: item.collegeCode, branchCode: item.branchCode });
      saveStateToStorage();
      renderSimulator();
      if (wasEmpty) track('optionForms');
      trackEvent('option_added', { college: item.collegeCode, branch: item.branchCode });
    });
    container.appendChild(card);
  });

  if (container.children.length === 0 && list.length > 0) {
    container.innerHTML = `<div class="empty-state" style="padding:20px"><p style="font-size:13px">All matching options already added.</p></div>`;
  }
  if (overflow > 0) {
    const note = document.createElement('div');
    note.style.cssText = 'padding:10px 14px;font-size:11px;color:var(--text-muted);text-align:center;border-top:1px solid var(--border)';
    note.textContent = `+ ${overflow} more — use Branch or District filters to narrow results`;
    container.appendChild(note);
  }
}

function renderSimulatorPreferences() {
  const container = document.getElementById('pref-list-container');
  const counter   = document.getElementById('pref-list-counter');
  container.innerHTML = '';
  counter.textContent = `${state.optionList.length} options. Reorder to set priority.`;

  if (state.optionList.length === 0) {
    container.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="1.5" fill="none" class="empty-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg><p>Option Form is Empty</p><p class="sub-text">Click "+" on the left to add college branches.</p></div>`;
    return;
  }

  const rank  = state.studentRank;
  const cgKey = getCgKey();

  state.optionList.forEach((item, index) => {
    const college = COLLEGES.find(c => c.code === item.collegeCode);
    const branch  = college?.branches.find(b => b.code === item.branchCode);
    if (!college) return;

    const card = document.createElement('div');
    card.className = 'pref-item-card';
    card.draggable = true;

    const probHtml = branch && rank ? getMultiPhaseChance(rank, branch, cgKey) : '';

    card.innerHTML = `
      <span class="pref-rank-badge">${index + 1}</span>
      <div class="pref-item-info">
        <div class="pref-item-title">${college.code} – ${college.name}</div>
        <div class="pref-item-sub">Branch: <strong>${item.branchCode}</strong>${branch ? ` (${branch.name})` : ''}</div>
        ${probHtml}
      </div>
      <div class="pref-reorder-actions">
        <button type="button" class="btn-reorder btn-move-up" title="Move Up" ${index===0?'disabled':''}>▲</button>
        <button type="button" class="btn-reorder btn-move-down" title="Move Down" ${index===state.optionList.length-1?'disabled':''}>▼</button>
      </div>
      <button type="button" class="btn-delete-pref" title="Remove">✕</button>
    `;

    card.querySelector('.btn-move-up').addEventListener('click', () => {
      if (index > 0) { [state.optionList[index], state.optionList[index-1]] = [state.optionList[index-1], state.optionList[index]]; saveStateToStorage(); renderSimulator(); }
    });
    card.querySelector('.btn-move-down').addEventListener('click', () => {
      if (index < state.optionList.length - 1) { [state.optionList[index], state.optionList[index+1]] = [state.optionList[index+1], state.optionList[index]]; saveStateToStorage(); renderSimulator(); }
    });
    card.querySelector('.btn-delete-pref').addEventListener('click', () => { state.optionList.splice(index, 1); saveStateToStorage(); renderSimulator(); });

    // Drag-and-drop reorder
    let dragSrcIndex = null;
    card.addEventListener('dragstart', () => { dragSrcIndex = index; card.style.opacity = '0.5'; });
    card.addEventListener('dragend', () => { card.style.opacity = '1'; });
    card.addEventListener('dragover', e => { e.preventDefault(); card.style.background = 'var(--primary-bg)'; });
    card.addEventListener('dragleave', () => { card.style.background = ''; });
    card.addEventListener('drop', e => {
      e.preventDefault(); card.style.background = '';
      if (dragSrcIndex !== null && dragSrcIndex !== index) {
        const moved = state.optionList.splice(dragSrcIndex, 1)[0];
        state.optionList.splice(index, 0, moved);
        saveStateToStorage(); renderSimulator();
      }
    });

    container.appendChild(card);
  });
}

function runAllotmentSimulation() {
  const rank  = state.studentRank;
  const cgKey = getCgKey();
  if (!rank) { alert('Enter your EAPCET rank in the sidebar first.'); return; }
  if (state.optionList.length === 0) { alert('Add at least one preference to the option form first.'); return; }
  track('simulations');
  trackEvent('simulation_run', { rank, optionCount: state.optionList.length, category: state.category });

  let allotted = null;
  let allottedIdx = -1;
  for (let i = 0; i < state.optionList.length; i++) {
    const opt     = state.optionList[i];
    const college = COLLEGES.find(c => c.code === opt.collegeCode);
    if (!college) continue;
    const branch = college.branches.find(b => b.code === opt.branchCode);
    if (!branch) continue;
    const cutoff = branch.cutoffs[cgKey];
    if (cutoff && rank <= cutoff) { allotted = { college, branch, cutoff }; allottedIdx = i + 1; break; }
  }

  const modal = document.getElementById('allotment-modal');
  const body  = document.getElementById('allotment-result-body');

  if (allotted) {
    const feeStr = allotted.college.fee_1yr ? `₹${allotted.college.fee_1yr.toLocaleString()}` : 'N/A';
    const totalStr = allotted.college.fee_total ? `₹${allotted.college.fee_total.toLocaleString()}` : 'N/A';
    const { label } = getReimbursementStatus(rank, state.incomeLevel, state.tsStudy, state.category);

    const now = new Date();
    let phaseLabel = 'Phase 1';
    let feeDeadline = 'July 10–14, 2026';
    let physicalRequired = false;
    let physicalDate = '';
    if (now >= new Date('2026-07-17')) { phaseLabel = 'Phase 2'; feeDeadline = 'July 22–24, 2026'; physicalRequired = true; physicalDate = 'July 25–28, 2026'; }
    if (now >= new Date('2026-07-31')) { phaseLabel = 'Final Phase'; feeDeadline = 'Aug 5–7, 2026'; physicalRequired = true; physicalDate = 'Aug 5–7, 2026'; }

    const phase2Warning = physicalRequired ? `
      <div class="allotment-phase2-alert">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <strong>${phaseLabel}: Physical College Reporting is MANDATORY</strong>
          <p>You MUST physically report at <strong>${allotted.college.name}</strong> by <strong>${physicalDate}</strong>. Submit original TC + get acknowledgement. If you skip this, you are barred from Final Phase.</p>
        </div>
      </div>` : '';

    body.innerHTML = `
      <div class="allotment-success-icon"><svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg></div>
      <div class="allotment-status-text" style="color:var(--safe-color)">SEAT ALLOTTED!</div>
      <p class="allotment-subtext">Based on rank <strong>${rank.toLocaleString()}</strong> and 2025 Final Phase cutoffs, you would be allotted at preference choice <strong>#${allottedIdx}</strong>.</p>
      <div class="allotment-card">
        <div class="allotment-card-lbl">Allotted College</div>
        <div class="allotment-card-name">${allotted.college.name}</div>
        <div class="allotment-card-branch">${allotted.branch.code} – ${allotted.branch.name}</div>
        <div class="allotment-card-meta"><span>📍 ${allotted.college.place}</span><span>Cutoff: ${allotted.cutoff.toLocaleString()}</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0">
        <div class="detail-meta-box"><div class="lbl">1 Year Fee</div><div class="val" style="color:var(--primary)">${feeStr}</div></div>
        <div class="detail-meta-box"><div class="lbl">Total Fee</div><div class="val">${totalStr}</div></div>
        <div class="detail-meta-box" style="grid-column:span 2"><div class="lbl">Fee Reimbursement</div><div class="val" style="font-size:13px">${label}</div></div>
      </div>
      <div class="allotment-action-steps">
        <div class="action-steps-title">✅ What to do now (${phaseLabel})</div>
        <div class="action-step"><span class="step-num">1</span><div><strong>Download your Allotment Order</strong> from <a href="https://tgeapcet.nic.in" target="_blank" rel="noopener">tgeapcet.nic.in</a></div></div>
        <div class="action-step"><span class="step-num">2</span><div><strong>Pay Tuition Fee online</strong> — deadline: <strong>${feeDeadline}</strong>. Late payment = seat cancellation.</div></div>
        <div class="action-step"><span class="step-num">3</span><div><strong>Self-report on the portal</strong> after fee payment to officially accept the seat.</div></div>
        ${physicalRequired ? `<div class="action-step urgent"><span class="step-num">4</span><div><strong>Physically report at the college</strong> by <strong>${physicalDate}</strong>. Bring originals + TC. Get an acknowledgement slip.</div></div>` : '<div class="action-step"><span class="step-num">4</span><div>Phase 1 only requires online self-reporting. Physical reporting is optional — but recommended to confirm admission.</div></div>'}
        <div class="action-step"><span class="step-num">5</span><div>Classes begin <strong>August 1, 2026</strong> per AICTE calendar.</div></div>
      </div>
      ${phase2Warning}
      <p style="font-size:11px;color:var(--text-muted);text-align:center;margin-top:12px">Simulation based on 2025 data. Verify on tgeapcet.nic.in before acting.</p>
    `;
  } else {
    // Find closest options — rank gap from student rank to each cutoff
    const closestOptions = state.optionList.map(opt => {
      const college = COLLEGES.find(c => c.code === opt.collegeCode);
      if (!college) return null;
      const branch = college.branches.find(b => b.code === opt.branchCode);
      if (!branch) return null;
      const cutoff = branch.cutoffs?.[cgKey];
      if (!cutoff) return null;
      return { college, branch, cutoff, gap: rank - cutoff };
    }).filter(Boolean).sort((a, b) => a.gap - b.gap);

    const bestCutoff = closestOptions.length > 0 ? closestOptions[0].cutoff : null;
    const top3 = closestOptions.slice(0, 3);

    const closestRowsHtml = top3.map((item, i) => `
      <div class="closest-option-row">
        <div class="closest-rank">#${i + 1}</div>
        <div class="closest-info">
          <div class="closest-college">${item.college.name.replace(/\n/g,' ')}</div>
          <div class="closest-branch">${item.branch.code} — 2025 cutoff: <strong>${item.cutoff.toLocaleString()}</strong></div>
        </div>
        <div class="closest-gap">Need <strong>${item.gap.toLocaleString()}</strong> better</div>
      </div>`).join('');

    body.innerHTML = `
      <div class="allotment-fail-icon"><svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
      <div class="allotment-status-text" style="color:var(--reach-color)">NO SEAT ALLOTTED</div>
      <p class="allotment-subtext">None of your <strong>${state.optionList.length} preferences</strong> had a 2025 cutoff that qualifies your rank of <strong>${rank.toLocaleString()}</strong>.</p>
      ${bestCutoff ? `
      <div class="qualify-rank-box">
        <div class="qualify-rank-label">You would qualify if your rank were</div>
        <div class="qualify-rank-value">${bestCutoff.toLocaleString()} or better</div>
        <div class="qualify-rank-sub">That's ${(rank - bestCutoff).toLocaleString()} ranks improvement needed for your closest preference</div>
      </div>
      <div class="closest-options-section">
        <div class="closest-options-title">🎯 Closest Preferences (Least Gap)</div>
        ${closestRowsHtml}
      </div>` : ''}
      <div class="allotment-card" style="margin-top:12px">
        <p style="font-size:13px;color:var(--text-primary)"><strong>Advice:</strong> Add mid-tier and lower-ranked private colleges to your option form — cutoffs relax each phase. Use the <em>Phase Strategy</em> guide in the Counselling tab.</p>
      </div>
    `;
  }
  modal.classList.add('open');
}

// ── Checklist & Timeline ───────────────────────────────────────
function initChecklistAndTimeline() {
  document.getElementById('btn-close-modal').addEventListener('click', () => document.getElementById('college-modal').classList.remove('open'));
  document.getElementById('btn-wa-share-checklist')?.addEventListener('click', shareChecklistWhatsApp);
}

function renderChecklist() {
  const container = document.getElementById('checklist-container');
  if (!container) return;
  container.innerHTML = '';
  CHECKLIST.forEach(item => {
    const checked = state.checklist[item.id] || false;
    const div = document.createElement('div');
    div.className = `checklist-item ${checked ? 'checked' : ''}`;
    div.innerHTML = `
      <input type="checkbox" class="checklist-checkbox" id="chk-${item.id}" ${checked?'checked':''}>
      <div class="checklist-item-info">
        <div class="checklist-item-title">${item.name} ${item.mandatory?'<span class="mandatory-tag">Mandatory</span>':'<span class="optional-tag">Conditional</span>'}</div>
        <div class="checklist-item-desc">${item.desc}</div>
      </div>
    `;
    div.querySelector('.checklist-checkbox').addEventListener('change', e => {
      state.checklist[item.id] = e.target.checked; div.classList.toggle('checked', e.target.checked); saveStateToStorage();
    });
    container.appendChild(div);
  });
}

function renderDetailedChecklist() {
  const container = document.getElementById('detailed-checklist-container');
  if (!container) return;
  container.innerHTML = '';

  const DOC_LINKS = {
    rank_card:    { name: 'TS EAPCET Rank Card', link: 'https://eapcet.tgche.ac.in/', label: 'Download from official portal' },
    hall_ticket:  { name: 'TS EAPCET Hall Ticket', link: 'https://eapcet.tgche.ac.in/', label: 'Download from official portal' },
    ssc_memo:     { name: 'SSC Marks Memo (Class 10)', link: null, label: null },
    inter_memo:   { name: 'Inter Marks Memo (Class 12 MPC)', link: null, label: null },
    study_cert:   { name: 'Study Certificates (Class 6–12)', link: 'https://ts.meeseva.telangana.gov.in/', label: 'Apply via MeeSeva' },
    tc:           { name: 'Transfer Certificate (TC)', link: null, label: 'From your last attended college' },
    aadhaar:      { name: 'Aadhaar Card', link: 'https://myaadhaar.uidai.gov.in/', label: 'Download e-Aadhaar' },
    caste_cert:   { name: 'Caste/Category Certificate', link: 'https://ts.meeseva.telangana.gov.in/', label: 'Apply via MeeSeva' },
    income_cert:  { name: 'Income Certificate', link: 'https://ts.meeseva.telangana.gov.in/', label: 'Apply via MeeSeva (must be 2026)' },
    ews_cert:     { name: 'EWS Income & Asset Certificate', link: 'https://ts.meeseva.telangana.gov.in/', label: 'Apply via MeeSeva' },
    photos:       { name: 'Passport Size Photographs (×4)', link: null, label: 'White background, recent' },
    processing_receipt: { name: 'Processing Fee Receipt', link: 'https://eapcet.tgche.ac.in/', label: 'Generated after online payment' }
  };

  CHECKLIST.forEach(item => {
    const extra = DOC_LINKS[item.id] || {};
    const checked = state.checklist[item.id] || false;
    const div = document.createElement('div');
    div.className = `checklist-item ${checked ? 'checked' : ''}`;
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <input type="checkbox" class="checklist-checkbox" id="dchk-${item.id}" ${checked?'checked':''}>
      <div class="checklist-item-info" style="flex:1">
        <div class="checklist-item-title">
          ${item.name}
          ${item.mandatory?'<span class="mandatory-tag">Mandatory</span>':'<span class="optional-tag">Conditional</span>'}
          ${extra.link ? `<a href="${extra.link}" target="_blank" rel="noopener" class="doc-download-link">↗ ${extra.label}</a>` : extra.label ? `<span style="font-size:10px;color:var(--text-muted)">${extra.label}</span>` : ''}
        </div>
        <div class="checklist-item-desc">${item.desc}</div>
      </div>
    `;
    div.querySelector('.checklist-checkbox').addEventListener('change', e => {
      state.checklist[item.id] = e.target.checked; div.classList.toggle('checked', e.target.checked); saveStateToStorage();
      // sync the other checklist too
      const mirror = document.getElementById(`chk-${item.id}`);
      if (mirror) mirror.checked = e.target.checked;
    });
    container.appendChild(div);
  });
}

function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  container.innerHTML = '';
  TIMELINE.forEach(phase => {
    const block = document.createElement('div');
    block.className = 'timeline-phase-block';
    const stepsHtml = phase.steps.map(s => `
      <div class="timeline-step">
        <div class="timeline-step-title">${s.title}</div>
        <div class="timeline-step-dates">${s.dates}</div>
        <div class="timeline-step-desc">${s.desc}</div>
      </div>
    `).join('');
    block.innerHTML = `<h4 class="timeline-phase-title">${phase.phase}</h4>${stepsHtml}`;
    container.appendChild(block);
  });
}

// ── College Details Modal ──────────────────────────────────────
function openCollegeModal(collegeCode) {
  const college = COLLEGES.find(c => c.code === collegeCode);
  if (!college) return;
  const modal = document.getElementById('college-modal');
  const title = document.getElementById('modal-college-name');
  const body  = document.getElementById('modal-college-body');
  title.textContent = college.name;

  const rank  = state.studentRank;
  const cgKey = getCgKey();
  const fee1  = college.fee_1yr   ? `₹${college.fee_1yr.toLocaleString()}`   : 'N/A';
  const feeT  = college.fee_total ? `₹${college.fee_total.toLocaleString()}` : 'N/A';
  const avgP  = college.avg_pkg   ? `${college.avg_pkg} LPA`   : 'N/A';
  const maxP  = college.highest_pkg ? `${college.highest_pkg} LPA` : 'N/A';

  const branchRows = college.branches.map(b => {
    const cutoff = b.cutoffs[cgKey];
    const chance = getAdmissionChance(rank, cutoff, state.rankBuffer, b.code);
    const p1 = b.cutoffs_p1?.[cgKey];
    const p2 = b.cutoffs_p2?.[cgKey];
    const seats = b.seats;
    return `<tr>
      <td style="font-weight:700">${b.code}</td>
      <td>${b.name}</td>
      <td>${seats ? `${seats.total_intake} (CV: ${seats.convener_quota})` : '60 (CV: 42)'}</td>
      <td style="font-size:11px;color:var(--text-muted)">${p1 ? p1.toLocaleString() : '—'}</td>
      <td style="font-size:11px;color:var(--text-muted)">${p2 ? p2.toLocaleString() : '—'}</td>
      <td style="font-weight:700">${cutoff ? cutoff.toLocaleString() : 'N/A'} ${getTrendIndicator(b, cgKey)}</td>
      <td style="text-align:right"><span class="chance-pill ${chance.class}">${chance.level}</span></td>
    </tr>`;
  }).join('');

  const websiteHtml = college.website
    ? `<a href="${college.website}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--secondary);font-weight:700;text-decoration:none;padding:6px 12px;border:1.5px solid rgba(123,63,242,0.3);border-radius:8px;margin-bottom:14px">
        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Visit Official Website ↗
       </a>`
    : '';

  body.innerHTML = `
    ${websiteHtml}
    <div class="detail-header-meta">
      <div class="detail-meta-box"><div class="lbl">Affiliation</div><div class="val">${college.affiliation}</div></div>
      <div class="detail-meta-box"><div class="lbl">NAAC Grade</div><div class="val" style="color:var(--border-color)">${college.naac}</div></div>
      <div class="detail-meta-box"><div class="lbl">Estd.</div><div class="val">${college.estd || 'N/A'}</div></div>
      <div class="detail-meta-box"><div class="lbl">Hostel</div><div class="val">${college.hostel}</div></div>
    </div>
    <div class="detail-section-title">Fees & Placements</div>
    <div class="detail-header-meta" style="margin-bottom:16px">
      <div class="detail-meta-box"><div class="lbl">1 Year Fee</div><div class="val" style="color:var(--primary)">${fee1}</div></div>
      <div class="detail-meta-box"><div class="lbl">Total Fee</div><div class="val">${feeT}</div></div>
      <div class="detail-meta-box"><div class="lbl">Avg Package</div><div class="val" style="color:var(--safe-color)">${avgP}</div></div>
      <div class="detail-meta-box"><div class="lbl">Highest Pkg</div><div class="val">${maxP}</div></div>
    </div>
    <div class="detail-section-title">Top Recruiters</div>
    <div class="detail-recruits-box">${college.recruiters || 'Data not available'}</div>
    <div class="detail-section-title">Branch Cutoffs — ${cgKey} (2025)</div>
    <table class="modal-branches-table">
      <thead><tr><th>Code</th><th>Branch</th><th>Intake</th><th>Phase 1</th><th>Phase 2</th><th>Final</th><th>Chance</th></tr></thead>
      <tbody>${branchRows}</tbody>
    </table>
  `;
  modal.classList.add('open');
}

// ── Sync Predictor → Option Form ───────────────────────────────
function initSyncToOptions() {
  document.getElementById('btn-sync-to-options')?.addEventListener('click', syncPredictorToOptionForm);
}

function syncPredictorToOptionForm() {
  const cgKey  = getCgKey();
  const rank   = state.studentRank;
  const buffer = state.rankBuffer;

  // Run the same filter logic as renderPredictor
  const filtered = COLLEGES.map(c => {
    if (state.searchQuery) {
      const q = state.searchQuery;
      if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q) &&
          !c.place.toLowerCase().includes(q) && !(c.district||'').toLowerCase().includes(q)) return null;
    }
    if (state.filterDistrictList.length > 0    && !state.filterDistrictList.includes(c.district)) return null;
    if (state.filterTypeList.length > 0) {
      const ok = state.filterTypeList.some(t => {
        if (t === 'GOV')    return c.type.includes('GOV') || c.type.includes('UNIV');
        if (t === 'PVT')    return c.type.includes('PVT');
        if (t === 'Deemed') return c.type.includes('Deemed');
        return false;
      });
      if (!ok) return null;
    }
    if (state.filterAffiliationList.length > 0 && !state.filterAffiliationList.some(a => c.affiliation.includes(a))) return null;
    if (state.gender === 'BOYS' && c.coed === 'GIRLS') return null;
    if (state.filterHostel && c.hostel !== 'Yes') return null;
    if (state.filterNaac   && !c.naac.includes('A')) return null;

    const branches = c.branches.filter(b => {
      if (state.filterBranchCodes.length === 0) return true;
      return state.filterBranchCodes.includes(b.code);
    }).map(b => ({ ...b, cutoff: b.cutoffs?.[cgKey] || 0, chance: getAdmissionChance(rank, b.cutoffs?.[cgKey], buffer, b.code) }));

    if (branches.length === 0) return null;
    return { ...c, branches, recommendedScore: getRecommendedScore(c) };
  }).filter(Boolean);

  // Sort colleges: Branch First uses Reach→Safe (counseling entry order, system picks best from top).
  // College First uses quality-score descending.
  filtered.sort((a, b) => {
    if (state.preferenceMode === 'branch') {
      if (a.bestChancePriority !== b.bestChancePriority) return b.bestChancePriority - a.bestChancePriority;
      return (b.recommendedScore || 0) - (a.recommendedScore || 0);
    }
    return (b.recommendedScore || 0) - (a.recommendedScore || 0);
  });

  const newOptions = [];

  if (state.preferenceMode === 'college') {
    // ── COLLEGE FIRST: Top 15 colleges → their preferred branches, then rest ──
    const TOP_N = 15;
    const top    = filtered.slice(0, TOP_N);
    const rest   = filtered.slice(TOP_N);

    const addCollegeOptions = (c) => {
      let orderedBranches;
      if (state.filterBranchCodes.length > 0) {
        // Branches in student's chosen priority order
        orderedBranches = state.filterBranchCodes
          .map(code => c.branches.find(b => b.code === code))
          .filter(Boolean);
      } else {
        // No branch filter: sort branches by lowest cutoff (best chance) first
        orderedBranches = [...c.branches].sort((a, b) => (a.cutoff || 999999) - (b.cutoff || 999999));
      }
      orderedBranches.forEach(b => {
        newOptions.push({ collegeCode: c.code, branchCode: b.code });
      });
    };

    top.forEach(addCollegeOptions);
    rest.forEach(addCollegeOptions);

  } else {
    // ── BRANCH FIRST: Each preferred branch across all colleges, sorted by quality ──
    if (state.filterBranchCodes.length > 0) {
      // For each selected branch in priority order, list all colleges that have it
      state.filterBranchCodes.forEach(branchCode => {
        filtered.forEach(c => {
          const branch = c.branches.find(b => b.code === branchCode);
          if (branch && !newOptions.some(o => o.collegeCode === c.code && o.branchCode === branchCode)) {
            newOptions.push({ collegeCode: c.code, branchCode });
          }
        });
      });
    } else {
      // No branch filter in branch-first mode — fall back to college-first behaviour
      filtered.forEach(c => {
        const orderedBranches = [...c.branches].sort((a, b) => (a.cutoff || 999999) - (b.cutoff || 999999));
        orderedBranches.forEach(b => {
          newOptions.push({ collegeCode: c.code, branchCode: b.code });
        });
      });
    }
  }

  if (newOptions.length === 0) {
    alert('No results in the predictor to sync. Apply rank and check filters.');
    return;
  }

  const modeDesc = state.preferenceMode === 'college'
    ? `College First (top ${Math.min(15, filtered.length)} colleges prioritised)`
    : 'Branch First (preferred branches across all colleges)';

  if (state.optionList.length > 0) {
    const ok = confirm(
      `Replace ${state.optionList.length} existing option(s) with ${newOptions.length} new options?\n\nMode: ${modeDesc}\n\nClick OK to replace, Cancel to keep existing.`
    );
    if (!ok) return;
  }

  state.optionList = newOptions;
  saveStateToStorage();

  // Switch to Option Form tab
  document.querySelector('.nav-tab-btn[data-tab="option-simulator"]')?.click();
}

// ── Share & Export ─────────────────────────────────────────────
function initShareAndExport() {
  document.getElementById('btn-share-url').addEventListener('click', () => {
    const url = buildShareUrl();
    document.getElementById('share-url-input').value = url;
    document.getElementById('share-modal').classList.add('open');
    track('shares');
  });
  document.getElementById('btn-close-share').addEventListener('click', () => document.getElementById('share-modal').classList.remove('open'));
  document.getElementById('btn-copy-url').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('share-url-input').value).then(() => {
      const msg = document.getElementById('share-copy-msg');
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 2500);
    });
  });

}

// ── Multi-Select Filter System ─────────────────────────────────
const msFilterConfig = {};

function initMultiSelectFilters() {
  // Build branch options from actual COLLEGES data (not BRANCH_REF which has different keys)
  const branchMap = {};
  COLLEGES.forEach(c => c.branches.forEach(b => {
    // Skip malformed header rows from CSV parsing artifacts
    if (!b.code || b.code.includes('\n') || b.code.length > 10) return;
    if (!branchMap[b.code]) branchMap[b.code] = (b.name || b.code).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }));
  const branchOptions = Object.entries(branchMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([code, name]) => ({ value: code, label: `${code} – ${name}` }));

  const districtOptions = [...new Set(COLLEGES.map(c => c.district).filter(Boolean))].sort()
    .map(d => ({ value: d, label: d }));

  const typeOptions = [
    { value: 'GOV',    label: 'Govt / Constituent' },
    { value: 'PVT',    label: 'Private Unaided' },
    { value: 'Deemed', label: 'Deemed / Autonomous' },
  ];

  const affiliationOptions = [...new Set(COLLEGES.map(c => c.affiliation).filter(Boolean))].sort()
    .map(a => ({ value: a, label: a }));

  setupMsFilter('branch',      branchOptions,      'filterBranchCodes',     true);
  setupMsFilter('district',    districtOptions,     'filterDistrictList',    true);
  setupMsFilter('type',        typeOptions,         'filterTypeList',        false);
  setupMsFilter('affiliation', affiliationOptions,  'filterAffiliationList', false);

  document.getElementById('btn-add-filtered-to-options')
    ?.addEventListener('click', addAllFilteredToOptions);

  // Sync chips if URL params set state on load
  if (state.filterBranchCodes.length > 0)     updateChips('branch',      'filterBranchCodes',     branchOptions);
  if (state.filterDistrictList.length > 0)     updateChips('district',    'filterDistrictList',    districtOptions);
  if (state.filterTypeList.length > 0)         updateChips('type',        'filterTypeList',        typeOptions);
  if (state.filterAffiliationList.length > 0)  updateChips('affiliation', 'filterAffiliationList', affiliationOptions);
}

function setupMsFilter(id, options, stateKey, hasSearch) {
  msFilterConfig[id] = { options, stateKey };

  const trigger    = document.getElementById(`ms-trigger-${id}`);
  const panel      = document.getElementById(`ms-panel-${id}`);
  const optList    = document.getElementById(`ms-options-${id}`);
  const allBtn     = document.getElementById(`btn-msall-${id}`);
  const clearBtn   = document.getElementById(`btn-msclear-${id}`);
  const searchInput = hasSearch ? document.getElementById(`ms-search-${id}`) : null;
  if (!trigger || !panel || !optList) return;

  function renderDropdownOptions(filter = '') {
    optList.innerHTML = '';
    const shown = filter
      ? options.filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))
      : options;
    shown.forEach(opt => {
      const checked = state[stateKey].includes(opt.value);
      const item = document.createElement('label');
      item.className = `ms-option-item${checked ? ' checked' : ''}`;
      item.innerHTML = `
        <input type="checkbox" value="${escHtml(opt.value)}"${checked ? ' checked' : ''}>
        <span class="ms-option-label">${escHtml(opt.label)}</span>
      `;
      item.querySelector('input').addEventListener('change', e => {
        if (e.target.checked) {
          if (!state[stateKey].includes(opt.value)) state[stateKey].push(opt.value);
        } else {
          state[stateKey] = state[stateKey].filter(v => v !== opt.value);
        }
        item.classList.toggle('checked', e.target.checked);
        updateChips(id, stateKey, options);
        updateTriggerState(id, stateKey);
        renderPredictor();
      });
      optList.appendChild(item);
    });
  }

  renderDropdownOptions();

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const opening = !panel.classList.contains('ms-panel-open');
    document.querySelectorAll('.ms-panel').forEach(p => p.classList.remove('ms-panel-open'));
    document.querySelectorAll('.ms-trigger').forEach(t => t.classList.remove('open'));
    if (opening) {
      panel.classList.add('ms-panel-open');
      trigger.classList.add('open');
      if (searchInput) { searchInput.value = ''; renderDropdownOptions(); searchInput.focus(); }
    }
  });

  searchInput?.addEventListener('input', e => renderDropdownOptions(e.target.value));
  searchInput?.addEventListener('click', e => e.stopPropagation());

  allBtn?.addEventListener('click', e => {
    e.stopPropagation();
    state[stateKey] = options.map(o => o.value);
    renderDropdownOptions(searchInput?.value || '');
    updateChips(id, stateKey, options);
    updateTriggerState(id, stateKey);
    renderPredictor();
  });

  clearBtn?.addEventListener('click', e => {
    e.stopPropagation();
    state[stateKey] = [];
    renderDropdownOptions(searchInput?.value || '');
    updateChips(id, stateKey, options);
    updateTriggerState(id, stateKey);
    renderPredictor();
  });

  document.addEventListener('click', e => {
    const group = document.getElementById(`msgroup-${id}`);
    if (group && !group.contains(e.target)) {
      panel.classList.remove('ms-panel-open');
      trigger.classList.remove('open');
    }
  });
}

function updateTriggerState(id, stateKey) {
  const trigger     = document.getElementById(`ms-trigger-${id}`);
  const ph          = document.getElementById(`ms-ph-${id}`);
  const countBadge  = document.getElementById(`ms-count-${id}`);
  const selected    = state[stateKey];
  const placeholder = id === 'branch' ? 'All Branches' : id === 'district' ? 'All Districts' : id === 'type' ? 'All Types' : 'All Affiliations';

  if (selected.length === 0) {
    trigger?.classList.remove('has-selection');
    if (ph) ph.textContent = placeholder;
    if (countBadge) countBadge.style.display = 'none';
  } else {
    trigger?.classList.add('has-selection');
    if (ph) ph.textContent = `${selected.length} selected`;
    if (countBadge) { countBadge.textContent = selected.length; countBadge.style.display = 'inline-flex'; }
  }
}

function updateChips(id, stateKey, options) {
  const chipsRow    = document.getElementById(`chips-row-${id}`);
  const chipsCtr    = document.getElementById(`chips-${id}`);
  const chipsSection = document.getElementById('filter-chips-section');
  const addAllRow   = document.getElementById('chips-add-all-row');
  const selected    = state[stateKey];
  if (!chipsRow || !chipsCtr) return;

  chipsRow.style.display = selected.length > 0 ? 'flex' : 'none';

  const anySelected = ['filterBranchCodes','filterDistrictList','filterTypeList','filterAffiliationList']
    .some(k => state[k].length > 0);
  if (chipsSection) chipsSection.style.display = anySelected ? 'flex' : 'none';
  if (addAllRow)    addAllRow.style.display    = anySelected ? 'flex' : 'none';

  chipsCtr.innerHTML = '';
  const isBranch = id === 'branch';
  selected.forEach((val, idx) => {
    const optData = options.find(o => o.value === val);
    const displayLabel = isBranch ? val : (optData?.label || val);
    const chip = document.createElement('div');
    chip.className = 'filter-chip';
    chip.draggable = isBranch;
    chip.dataset.value = val;
    chip.innerHTML = isBranch
      ? `<span class="chip-priority">${idx + 1}</span>
         <span class="chip-drag">⠿</span>
         <span class="chip-label">${escHtml(displayLabel)}</span>
         <button type="button" class="chip-remove" aria-label="Remove">×</button>`
      : `<span class="chip-label">${escHtml(displayLabel)}</span>
         <button type="button" class="chip-remove" aria-label="Remove">×</button>`;

    chip.querySelector('.chip-remove').addEventListener('click', e => {
      e.stopPropagation();
      state[stateKey] = state[stateKey].filter(v => v !== val);
      const cb = optList(id)?.querySelector(`input[value="${CSS.escape(val)}"]`);
      if (cb) { cb.checked = false; cb.closest('.ms-option-item')?.classList.remove('checked'); }
      updateChips(id, stateKey, options);
      updateTriggerState(id, stateKey);
      renderPredictor();
    });

    if (isBranch) {
      chip.addEventListener('dragstart', e => {
        e.dataTransfer.setData('drag-ms-id', id);
        e.dataTransfer.setData('drag-ms-val', val);
        chip.classList.add('chip-dragging');
      });
      chip.addEventListener('dragend', () => chip.classList.remove('chip-dragging'));
      chip.addEventListener('dragover', e => { e.preventDefault(); chip.classList.add('chip-drag-over'); });
      chip.addEventListener('dragleave', () => chip.classList.remove('chip-drag-over'));
      chip.addEventListener('drop', e => {
        e.preventDefault();
        chip.classList.remove('chip-drag-over');
        const fromId  = e.dataTransfer.getData('drag-ms-id');
        const fromVal = e.dataTransfer.getData('drag-ms-val');
        if (fromId !== id || fromVal === val) return;
        const fi = state[stateKey].indexOf(fromVal);
        const ti = state[stateKey].indexOf(val);
        if (fi !== -1 && ti !== -1) {
          state[stateKey].splice(fi, 1);
          state[stateKey].splice(ti, 0, fromVal);
          updateChips(id, stateKey, options);
          renderPredictor();
        }
      });
    }

    chipsCtr.appendChild(chip);
  });
}

function optList(id) {
  return document.getElementById(`ms-options-${id}`);
}

function updateAllChipsUI() {
  Object.entries(msFilterConfig).forEach(([id, cfg]) => {
    updateChips(id, cfg.stateKey, cfg.options);
    updateTriggerState(id, cfg.stateKey);
    optList(id)?.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const checked = state[cfg.stateKey].includes(cb.value);
      cb.checked = checked;
      cb.closest('.ms-option-item')?.classList.toggle('checked', checked);
    });
  });
}

function addAllFilteredToOptions() {
  let added = 0;

  // Filter colleges the same way the predictor does
  const eligible = COLLEGES.filter(c => {
    if (state.filterDistrictList.length > 0 && !state.filterDistrictList.includes(c.district)) return false;
    if (state.filterTypeList.length > 0) {
      const ok = state.filterTypeList.some(t => {
        if (t === 'GOV')    return c.type.includes('GOV') || c.type.includes('UNIV');
        if (t === 'PVT')    return c.type.includes('PVT');
        if (t === 'Deemed') return c.type.includes('Deemed');
        return false;
      });
      if (!ok) return false;
    }
    if (state.filterAffiliationList.length > 0 && !state.filterAffiliationList.some(a => c.affiliation.includes(a))) return false;
    if (state.gender === 'BOYS' && c.coed === 'GIRLS') return false;
    if (state.filterHostel && c.hostel !== 'Yes') return false;
    if (state.filterNaac && !c.naac.includes('A')) return false;
    return true;
  }).map(c => ({ ...c, _recScore: getRecommendedScore(c) }))
    .sort((a, b) => b._recScore - a._recScore);

  const appendOption = (collegeCode, branchCode) => {
    if (!state.optionList.some(o => o.collegeCode === collegeCode && o.branchCode === branchCode)) {
      state.optionList.push({ collegeCode, branchCode });
      added++;
    }
  };

  if (state.preferenceMode === 'college') {
    // College First — top 15 colleges × their preferred branches, then rest
    const top  = eligible.slice(0, 15);
    const rest = eligible.slice(15);
    [...top, ...rest].forEach(c => {
      const branches = state.filterBranchCodes.length > 0
        ? state.filterBranchCodes.map(code => c.branches.find(b => b.code === code)).filter(Boolean)
        : c.branches;
      branches.forEach(b => appendOption(c.code, b.code));
    });
  } else {
    // Branch First — each preferred branch across all colleges, then remaining
    if (state.filterBranchCodes.length > 0) {
      state.filterBranchCodes.forEach(branchCode => {
        eligible.forEach(c => {
          const b = c.branches.find(b => b.code === branchCode);
          if (b) appendOption(c.code, branchCode);
        });
      });
    } else {
      eligible.forEach(c => c.branches.forEach(b => appendOption(c.code, b.code)));
    }
  }

  const btn = document.getElementById('btn-add-filtered-to-options');
  if (added > 0) {
    saveStateToStorage();
    if (btn) {
      const orig = btn.innerHTML;
      btn.textContent = `✔ Added ${added} options`;
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2500);
    }
  } else {
    if (btn) {
      btn.textContent = 'All already in form';
      setTimeout(() => { btn.textContent = 'Add All Filtered to Option Form'; }, 2000);
    }
  }
}

// ── Split Branch View ──────────────────────────────────────────
function renderSplitBranchView(container, colleges) {
  const TIERS = [
    { key: 'safe',       label: '🟢 Safe Picks',  cls: 'safe' },
    { key: 'likely',     label: '🔵 Good Bets',    cls: 'likely' },
    { key: 'borderline', label: '🟡 Borderline',   cls: 'borderline' },
    { key: 'reach',      label: '🔴 Reach',        cls: 'reach' },
  ];

  state.filterBranchCodes.forEach((branchCode, priorityIdx) => {
    const items = [];
    colleges.forEach(c => {
      const branch = c.branches.find(b => b.code === branchCode);
      if (branch) items.push({ college: c, branch });
    });
    if (items.length === 0) return;

    const branchInfo = BRANCH_REF[branchCode];

    const section = document.createElement('div');
    section.className = 'branch-priority-section';

    const header = document.createElement('div');
    header.className = 'branch-priority-header';
    header.innerHTML = `
      <span class="branch-priority-number">${priorityIdx + 1}</span>
      <div class="branch-priority-info">
        <span class="branch-priority-code">${branchCode}</span>
        <span class="branch-priority-name">${branchInfo ? branchInfo.name : ''}</span>
      </div>
      <span class="branch-priority-count">${items.length} college${items.length > 1 ? 's' : ''}</span>
      <span class="tier-toggle-icon">▾</span>
    `;

    const content = document.createElement('div');
    content.className = 'branch-priority-content';

    let collapsed = false;
    header.addEventListener('click', () => {
      collapsed = !collapsed;
      content.style.display = collapsed ? 'none' : '';
      header.querySelector('.tier-toggle-icon').textContent = collapsed ? '▸' : '▾';
    });

    // Sub-group by tier
    const tierGroups = { safe: [], likely: [], borderline: [], reach: [] };
    items.forEach(item => {
      const raw = item.branch.chance?.tier;
      const tier = (raw && tierGroups[raw]) ? raw : 'reach';
      tierGroups[tier].push(item);
    });

    const distSort = (a, b) => (b.college.recommendedScore || 0) - (a.college.recommendedScore || 0);

    let hasCards = false;
    TIERS.forEach(({ key, label, cls }) => {
      let group = tierGroups[key];
      if (group.length === 0) return;
      group.sort(distSort);
      if (state.prioritizeWomens) group.sort((a, b) => (a.college.coed === 'GIRLS' ? -1 : b.college.coed === 'GIRLS' ? 1 : 0));
      hasCards = true;

      const miniHdr = document.createElement('div');
      miniHdr.className = `mini-tier-header ${cls}`;
      miniHdr.textContent = `${label} (${group.length})`;
      content.appendChild(miniHdr);

      const grid = document.createElement('div');
      grid.className = 'tier-cards-grid';
      group.forEach(item => grid.appendChild(buildBranchCard(item.college, item.branch)));
      content.appendChild(grid);
    });

    if (!hasCards) return;
    section.appendChild(header);
    section.appendChild(content);
    container.appendChild(section);
  });
}

function renderSplitBranchTableView(container, colleges, cgKey) {
  const TIERS = [
    { key: 'safe',       label: '🟢 Safe Picks',  cls: 'safe' },
    { key: 'likely',     label: '🔵 Good Bets',    cls: 'likely' },
    { key: 'borderline', label: '🟡 Borderline',   cls: 'borderline' },
    { key: 'reach',      label: '🔴 Reach',        cls: 'reach' },
  ];

  state.filterBranchCodes.forEach((branchCode, priorityIdx) => {
    const items = [];
    colleges.forEach(c => {
      const branch = c.branches.find(b => b.code === branchCode);
      if (branch) items.push({ college: c, branch });
    });
    if (items.length === 0) return;

    const branchInfo = BRANCH_REF[branchCode];

    const section = document.createElement('div');
    section.className = 'branch-priority-section';

    const header = document.createElement('div');
    header.className = 'branch-priority-header';
    header.innerHTML = `
      <span class="branch-priority-number">${priorityIdx + 1}</span>
      <div class="branch-priority-info">
        <span class="branch-priority-code">${branchCode}</span>
        <span class="branch-priority-name">${branchInfo ? branchInfo.name : ''}</span>
      </div>
      <span class="branch-priority-count">${items.length} college${items.length > 1 ? 's' : ''}</span>
      <span class="tier-toggle-icon">▾</span>
    `;

    const content = document.createElement('div');
    content.className = 'branch-priority-content';

    let collapsed = false;
    header.addEventListener('click', () => {
      collapsed = !collapsed;
      content.style.display = collapsed ? 'none' : '';
      header.querySelector('.tier-toggle-icon').textContent = collapsed ? '▸' : '▾';
    });

    // Group by tier
    const tierGroups = { safe: [], likely: [], borderline: [], reach: [] };
    items.forEach(item => {
      const raw = item.branch.chance?.tier;
      const tier = (raw && tierGroups[raw]) ? raw : 'reach';
      tierGroups[tier].push(item);
    });

    const distSort = (a, b) => (b.college.recommendedScore || 0) - (a.college.recommendedScore || 0);

    const wrap = document.createElement('div');
    wrap.className = 'predictions-table-wrap';
    const table = document.createElement('table');
    table.className = 'predictions-table';
    table.innerHTML = `<thead><tr>
      <th>#</th><th>College</th><th>Cutoff (Final)</th><th>P1</th><th>P2</th>
      <th>Chance</th><th>2026 Est.</th><th>Fee/yr</th><th>Avg Pkg</th><th></th>
    </tr></thead>`;
    const tbody = document.createElement('tbody');

    let rowNum = 0;
    let hasRows = false;

    TIERS.forEach(({ key, label, cls }) => {
      let group = tierGroups[key];
      if (group.length === 0) return;
      group.sort(distSort);
      if (state.prioritizeWomens) group.sort((a, b) => (a.college.coed === 'GIRLS' ? -1 : b.college.coed === 'GIRLS' ? 1 : 0));
      hasRows = true;

      // Tier sub-header row
      const tierRow = document.createElement('tr');
      tierRow.className = `table-tier-subheader tier-subhdr-${cls}`;
      tierRow.innerHTML = `<td colspan="10" class="tier-subhdr-cell">${label} (${group.length})</td>`;
      tbody.appendChild(tierRow);

      group.forEach(({ college: c, branch: b }) => {
        rowNum++;
        const p1 = b.cutoffs_p1?.[cgKey];
        const p2 = b.cutoffs_p2?.[cgKey];
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="color:var(--text-muted);font-size:11px">${rowNum}</td>
          <td><div class="table-college-name">${c.name}</div><div style="font-size:10px;color:var(--text-muted)">${c.code} · ${c.district}</div></td>
          <td style="font-weight:700">${b.cutoff ? b.cutoff.toLocaleString() : 'N/A'} ${b.trend || ''}</td>
          <td style="font-size:11px;color:var(--text-muted)">${p1 ? p1.toLocaleString() : '—'}</td>
          <td style="font-size:11px;color:var(--text-muted)">${p2 ? p2.toLocaleString() : '—'}</td>
          <td><span class="chance-pill ${b.chance.class}">${b.chance.level}</span></td>
          <td>${b.prob2026 ? `<span class="prob-2026 ${b.prob2026.cls}" title="Est. 2026 cutoff: ~${b.prob2026.est2026.toLocaleString()}">${b.prob2026.probability}% · ${b.prob2026.label}</span>` : '<span style="color:var(--text-muted);font-size:11px">—</span>'}</td>
          <td style="font-size:12px">${c.fee_1yr ? '₹'+c.fee_1yr.toLocaleString() : 'N/A'}</td>
          <td style="font-size:12px;font-weight:700;color:var(--safe-color)">${c.avg_pkg ? c.avg_pkg+' LPA' : 'N/A'}</td>
          <td><button class="btn btn-secondary btn-sm" style="white-space:nowrap" data-code="${c.code}">Details</button></td>
        `;
        tr.querySelector('button').addEventListener('click', () => openCollegeModal(c.code));
        tbody.appendChild(tr);
      });
    });

    if (!hasRows) return;
    table.appendChild(tbody);
    wrap.appendChild(table);
    content.appendChild(wrap);
    section.appendChild(header);
    section.appendChild(content);
    container.appendChild(section);
  });
}

function buildBranchCard(c, b) {
  const card = document.createElement('div');
  card.className = `college-card branch-card glass-panel tier-${b.chance?.tier || 'reach'}`;

  const inCompare = state.compareList.includes(c.code);
  const feeStr = c.fee_1yr ? `₹${c.fee_1yr.toLocaleString()}/yr` : 'N/A';
  const avgStr = c.avg_pkg ? `${c.avg_pkg} LPA` : 'N/A';
  const cgKey  = getCgKey();
  const p1 = b.cutoffs_p1?.[cgKey];
  const p2 = b.cutoffs_p2?.[cgKey];

  let badgesHtml = `<span class="tag-badge ${c.type.toLowerCase().includes('gov') ? 'govt' : 'pvt'}">${c.type}</span>`;
  if (c.naac && c.naac !== 'N/A') badgesHtml += `<span class="tag-badge naac">NAAC ${c.naac}</span>`;
  if (c.hostel === 'Yes') badgesHtml += `<span class="tag-badge hostel">Hostel</span>`;

  card.innerHTML = `
    <div class="card-glow-edge"></div>
    <div class="branch-hero-strip">
      <span class="b-code-xl">${b.code}</span>
      <span class="b-name-xl">${b.name}</span>
      <span class="chance-pill ${b.chance.class}">${b.chance.level}</span>
    </div>
    <div class="card-header-row" style="margin-top:8px">
      <div class="college-title-box">
        <span class="college-code-badge">${c.code}</span>
        <h4 class="college-name">${c.name}</h4>
        <p class="college-meta-loc">${c.place}, ${c.district} · ${c.affiliation}</p>
      </div>
      <button type="button" class="${inCompare ? 'btn-icon-only active' : 'btn-icon-only'}" title="Compare" data-compare-code="${c.code}">
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.5" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
      </button>
    </div>
    <div class="college-badges-row">${badgesHtml}</div>
    <div class="branch-cutoff-phases">
      <div class="phase-block"><span class="phase-lbl">Phase 1</span><span class="phase-val">${p1 ? p1.toLocaleString() : '—'}</span></div>
      <div class="phase-block"><span class="phase-lbl">Phase 2</span><span class="phase-val">${p2 ? p2.toLocaleString() : '—'}</span></div>
      <div class="phase-block final"><span class="phase-lbl">Final 2025</span><span class="phase-val">${b.cutoff ? b.cutoff.toLocaleString() : 'N/A'} ${b.trend || ''}</span></div>
    </div>
    <div class="college-stats-panel" style="margin-top:8px">
      <div class="stat-box"><span class="label">Fee/yr</span><span class="val">${feeStr}</span></div>
      <div class="stat-box"><span class="label">Avg Pkg</span><span class="val" style="color:var(--safe-color)">${avgStr}</span></div>
    </div>
    <div class="card-footer-buttons">
      <button type="button" class="btn btn-secondary btn-sm btn-detail" data-code="${c.code}">Full Details</button>
      <button type="button" class="btn btn-primary btn-sm btn-add-single-opt" data-college="${c.code}" data-branch="${b.code}">
        <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M12 5v14M5 12h14"/></svg>
        Add to Options
      </button>
    </div>
  `;

  card.querySelector('[data-compare-code]').addEventListener('click', e => { e.stopPropagation(); toggleCompare(c.code); });
  card.querySelector('.btn-detail').addEventListener('click', () => openCollegeModal(c.code));
  card.querySelector('.btn-add-single-opt').addEventListener('click', function () {
    if (!state.optionList.some(o => o.collegeCode === c.code && o.branchCode === b.code)) {
      state.optionList.push({ collegeCode: c.code, branchCode: b.code });
      saveStateToStorage();
    }
    this.innerHTML = '✔ Added';
    this.disabled = true;
    this.classList.replace('btn-primary', 'btn-secondary');
  });

  return card;
}

// ── Print & Share Option Form ──────────────────────────────────
function printOptionForm() {
  if (state.optionList.length === 0) { alert('Add at least one option before printing.'); return; }
  track('pdfDownloads');
  trackEvent('pdf_downloaded', { optionCount: state.optionList.length, rank: state.studentRank, category: state.category });
  const cgKey = getCgKey();
  const rows = state.optionList.map((item, i) => {
    const college = COLLEGES.find(c => c.code === item.collegeCode);
    const branch  = college?.branches.find(b => b.code === item.branchCode);
    const cutoff  = branch?.cutoffs?.[cgKey];
    return `<tr>
      <td style="font-weight:700">${i + 1}</td>
      <td>${item.collegeCode}</td>
      <td>${college ? college.name.replace(/\n/g,' ') : item.collegeCode}</td>
      <td>${item.branchCode}</td>
      <td>${branch ? branch.name.replace(/\n/g,' ') : item.branchCode}</td>
      <td>${cutoff ? cutoff.toLocaleString() : '—'}</td>
    </tr>`;
  }).join('');

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>TS-EAPCET Option Form</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      *{box-sizing:border-box}
      body{font-family:Arial,sans-serif;padding:14px;color:#000;margin:0}
      h2{margin-bottom:4px;font-size:16px}
      p{margin:2px 0;font-size:12px}
      table{border-collapse:collapse;width:100%;margin-top:14px;font-size:11px;table-layout:fixed}
      th,td{border:1px solid #ccc;padding:5px 6px;word-break:break-word}
      th{background:#222;color:#fff;text-align:left;font-size:10px}
      td:first-child,td:nth-child(2),td:nth-child(4),td:last-child{text-align:center;width:6%}
      td:nth-child(2){width:9%}
      td:nth-child(3){width:36%}
      td:nth-child(4){width:8%}
      td:nth-child(5){width:33%}
      td:last-child{width:8%}
      tr:nth-child(even){background:#f5f5f5}
      .print-bar{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
      @media print{.print-bar{display:none}}
    </style>
  </head><body>
    <div class="print-bar">
      <button onclick="window.print()" style="padding:7px 16px;background:#FF5722;color:#fff;border:none;border-radius:4px;font-size:13px;cursor:pointer">🖨 Print</button>
      <span style="font-size:11px;color:#666">TS-EAPCET 2026 Option Form — ${state.optionList.length} options</span>
    </div>
    <h2>TS-EAPCET 2026 — My Option Form</h2>
    <p>Rank: <strong>${state.studentRank ? '#' + state.studentRank.toLocaleString() : 'Not entered'}</strong> &nbsp;|&nbsp; Category: <strong>${state.category}</strong> &nbsp;|&nbsp; Gender: <strong>${state.gender}</strong></p>
    <p style="font-size:11px;color:#666">Cutoffs are from 2025 Final Phase (${cgKey}). Verify before submission.</p>
    <table>
      <thead><tr><th>#</th><th>Code</th><th>College</th><th>Branch</th><th>Branch Name</th><th>Cutoff 2025</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;font-size:11px;color:#888">Generated by MarsMate EAPCET · ${new Date().toLocaleDateString('en-IN')}</p>
  </body></html>`);
  win.document.close();
}

function shareOptionFormWhatsApp() {
  if (state.optionList.length === 0) { alert('Add at least one option before sharing.'); return; }
  const cgKey = getCgKey();

  // Build CSV rows
  const headers = ['Priority', 'College Code', 'College Name', 'Branch Code', 'Branch Name',
    'Cutoff 2025 (Final)', 'Phase 1 Cutoff', 'Phase 2 Cutoff', 'District', 'Fee / yr (₹)', 'Avg Package (LPA)'];

  const rows = state.optionList.map((item, i) => {
    const college = COLLEGES.find(c => c.code === item.collegeCode);
    const branch  = college?.branches.find(b => b.code === item.branchCode);
    const cutoff  = branch?.cutoffs?.[cgKey] ?? '';
    const p1      = branch?.cutoffs_p1?.[cgKey] ?? '';
    const p2      = branch?.cutoffs_p2?.[cgKey] ?? '';
    return [
      i + 1,
      item.collegeCode,
      (college?.name ?? item.collegeCode).replace(/\n/g, ' ').trim(),
      item.branchCode,
      (branch?.name ?? item.branchCode).replace(/\n/g, ' ').trim(),
      cutoff,
      p1,
      p2,
      college?.district ?? '',
      college?.fee_1yr ?? '',
      college?.avg_pkg ?? ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  // Metadata rows at top
  const meta = [
    `"TS-EAPCET 2026 — My Option Form"`,
    `"Rank: ${state.studentRank ? '#' + state.studentRank.toLocaleString() : 'Not entered'} | Category: ${state.category} | Gender: ${state.gender} | Region: ${state.region}"`,
    `"Generated by MarsMate EAPCET on ${new Date().toLocaleDateString('en-IN')}"`,
    '',
    headers.map(h => `"${h}"`).join(','),
    ...rows
  ];

  // UTF-8 BOM so Excel reads accented chars correctly
  const csvContent = '﻿' + meta.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `EAPCET_Option_Form_${state.studentRank ?? 'Rank'}_${state.category}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  track('shares');
}

// ── Preference Mode ───────────────────────────────────────────
function setPrefMode(mode) {
  state.preferenceMode = mode;

  const btnCollege = document.getElementById('btn-pref-college');
  const btnBranch  = document.getElementById('btn-pref-branch');
  const hint       = document.getElementById('pref-order-hint');

  btnCollege?.classList.toggle('active', mode === 'college');
  btnBranch?.classList.toggle('active',  mode === 'branch');

  if (hint) {
    hint.textContent = mode === 'college'
      ? 'Top 15 colleges → all preferred branches'
      : 'Branch 1 across all colleges → Branch 2 across all colleges';
  }

  renderPredictor();
}

// ── Live Phase Banner ──────────────────────────────────────────
function initLivePhaseBar() {
  const strip = document.getElementById('live-phase-strip');
  if (!strip) return;

  const now = new Date();
  const milestones = [
    { date: new Date('2026-06-28T23:59:00'), label: 'Phase 1 Slot Booking closes', phase: 'PHASE 1 — LIVE' },
    { date: new Date('2026-07-01T23:59:00'), label: 'Options freeze (Phase 1)',     phase: 'PHASE 1 — LIVE' },
    { date: new Date('2026-07-04T23:59:00'), label: 'Mock Allotment display',       phase: 'PHASE 1 — LIVE' },
    { date: new Date('2026-07-07T23:59:00'), label: 'Option modification ends',     phase: 'PHASE 1 — LIVE' },
    { date: new Date('2026-07-10T23:59:00'), label: 'Phase 1 Seat Allotment',       phase: 'PHASE 1 — LIVE' },
    { date: new Date('2026-07-14T23:59:00'), label: 'Fee payment + self-reporting deadline (Phase 1)', phase: 'PHASE 1 — LIVE' },
    { date: new Date('2026-07-17T23:59:00'), label: 'Phase 2 Slot Booking',         phase: 'PHASE 2 STARTS' },
    { date: new Date('2026-07-19T23:59:00'), label: 'Phase 2 options freeze',       phase: 'PHASE 2 — LIVE' },
    { date: new Date('2026-07-22T23:59:00'), label: 'Phase 2 Seat Allotment',       phase: 'PHASE 2 — LIVE' },
    { date: new Date('2026-07-24T23:59:00'), label: 'Fee payment deadline (Phase 2)', phase: 'PHASE 2 — LIVE' },
    { date: new Date('2026-07-28T23:59:00'), label: '⚠ MANDATORY physical college reporting (Phase 2)', phase: 'PHASE 2 — LIVE' },
    { date: new Date('2026-07-31T23:59:00'), label: 'Final Phase Slot Booking',     phase: 'FINAL PHASE STARTS' },
    { date: new Date('2026-08-02T23:59:00'), label: 'Final Phase options freeze',   phase: 'FINAL PHASE — LIVE' },
    { date: new Date('2026-08-05T23:59:00'), label: 'Final Phase Seat Allotment',   phase: 'FINAL PHASE — LIVE' },
    { date: new Date('2026-08-07T23:59:00'), label: 'Final Phase fee + reporting deadline', phase: 'FINAL PHASE — LIVE' },
    { date: new Date('2026-08-13T23:59:00'), label: 'Internal Sliding options freeze', phase: 'INTERNAL SLIDING' },
    { date: new Date('2026-08-16T23:59:00'), label: 'Spot Admissions begin',        phase: 'SPOT ADMISSIONS' },
  ];

  const upcoming = milestones.filter(m => m.date > now);
  if (!upcoming.length) { strip.style.display = 'none'; return; }

  const next     = upcoming[0];
  const diffMs   = next.date - now;
  const diffDays = Math.ceil(diffMs / 86400000);
  const daysText = diffDays === 0 ? 'TODAY' : diffDays === 1 ? '1 day' : `${diffDays} days`;

  const isUrgent = diffDays <= 2;
  const isSoon   = diffDays <= 5;

  strip.innerHTML = `
    <div class="live-phase-banner${isUrgent ? ' live-urgent' : isSoon ? ' live-soon' : ''}">
      <div class="live-badge-wrap">
        <span class="live-pulse-dot"></span>
        <span class="live-phase-label">${next.phase}</span>
      </div>
      <div class="live-next-info">
        <span class="live-next-text">Next: <strong>${next.label}</strong></span>
        <span class="live-countdown-pill${isUrgent ? ' urgent' : isSoon ? ' soon' : ''}">${daysText}</span>
      </div>
      <a href="https://tgeapcet.nic.in" target="_blank" rel="noopener" class="live-portal-link">Open Portal ↗</a>
    </div>
  `;
}

// ── Eligibility Warning ────────────────────────────────────────
function renderEligibilityWarning() {
  const box = document.getElementById('eligibility-warning');
  if (!box) return;

  const marks = state.studentMarks;
  const isOC  = state.category === 'OC' || state.category === 'EWS';
  const minPct = isOC ? 45 : 40;

  if (state.rankMode === 'marks' && marks !== null) {
    const totalPct = (marks / 160) * 100;
    if (totalPct < minPct) {
      box.style.display = 'block';
      box.innerHTML = `
        <div class="eligibility-warn-box">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <strong>Eligibility Risk</strong>
            <p>${marks}/160 marks = ${totalPct.toFixed(1)}%. ${isOC ? 'OC/EWS' : 'BC/SC/ST'} students need ≥${minPct}% in MPC group subjects. Verify your Intermediate marks carefully.</p>
          </div>
        </div>`;
      return;
    }
  }
  box.style.display = 'none';
}

// ── WhatsApp Checklist Share ───────────────────────────────────
function shareChecklistWhatsApp() {
  const checked   = CHECKLIST.filter(item => state.checklist[item.id]);
  const unchecked = CHECKLIST.filter(item => !state.checklist[item.id]);
  const lines = [
    '*TS-EAPCET 2026 — Certificate Checklist*',
    `\n✅ Ready (${checked.length}/${CHECKLIST.length}):`,
    ...checked.map(i => `✔ ${i.name}`),
    unchecked.length ? `\n⏳ Still Needed (${unchecked.length}):` : '',
    ...unchecked.map(i => `◻ ${i.name}${i.mandatory ? ' *' : ''}`),
    '\n_* = Mandatory_',
    '_Generated via MarsMate EAPCET_',
  ].filter(Boolean);
  window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
}

// ── After Allotment Guide ──────────────────────────────────────
function renderAfterAllotmentGuide() {
  const container = document.getElementById('after-allotment-content');
  if (!container) return;

  const now = new Date();
  let currentPhase = 1;
  if (now >= new Date('2026-07-17')) currentPhase = 2;
  if (now >= new Date('2026-07-31')) currentPhase = 3;

  const phases = [
    {
      num: 1, label: 'Phase 1',
      allotmentDate: 'on or before July 10',
      feeWindow: 'July 10–14, 2026',
      selfReport: true, physicalReport: false,
      cancellation: 'You can still participate in Phase 2 to try upgrading.',
      color: 'safe',
    },
    {
      num: 2, label: 'Phase 2',
      allotmentDate: 'on or before July 22',
      feeWindow: 'July 22–24, 2026',
      selfReport: true, physicalReport: true,
      physicalWindow: 'July 25–28, 2026',
      consequence: 'If you do NOT physically report by July 28 → you are BARRED from Final Phase.',
      cancellation: 'Last cancellation date: July 28. You may still participate in Final Phase to upgrade — but you MUST report physically first.',
      color: 'likely',
    },
    {
      num: 3, label: 'Final Phase',
      allotmentDate: 'on or before August 5',
      feeWindow: 'Aug 5–7, 2026',
      selfReport: true, physicalReport: true,
      physicalWindow: 'Aug 5–7, 2026 (if seat changed from earlier phase)',
      consequence: 'NO dropouts or cancellations allowed after Final Phase.',
      cancellation: 'This is FINAL. No further upgrades. Dropouts go to ECET lateral entry — not spot admissions.',
      color: 'borderline',
    },
  ];

  const activePhase = phases.find(p => p.num === currentPhase) || phases[0];

  const phaseHTML = (p) => `
    <div class="after-phase-card ${p.num === currentPhase ? 'active-phase' : ''}">
      <div class="after-phase-header phase-${p.color}">
        ${p.num === currentPhase ? '<span class="current-phase-badge">CURRENT</span>' : ''}
        <strong>${p.label}</strong>
        <span>Allotment: ${p.allotmentDate}</span>
      </div>
      <div class="after-phase-steps">
        <div class="after-step"><div class="after-step-num">1</div><div><strong>Download Allotment Order</strong><br><span>Login to <a href="https://tgeapcet.nic.in" target="_blank" rel="noopener">tgeapcet.nic.in</a> and download your order + Join Letter.</span></div></div>
        <div class="after-step"><div class="after-step-num">2</div><div><strong>Pay Tuition Fee Online</strong><br><span>Deadline: <strong>${p.feeWindow}</strong>. Use Credit/Debit card or Net Banking on the portal. Missing this = seat cancelled.</span></div></div>
        <div class="after-step"><div class="after-step-num">3</div><div><strong>Self-Report on Portal</strong><br><span>After fee payment, click "Self Report" to officially accept the seat. Take screenshot/print confirmation.</span></div></div>
        ${p.physicalReport ? `
        <div class="after-step urgent-step"><div class="after-step-num warn">4</div><div><strong>⚠ Physically Report at College</strong><br><span>By: <strong>${p.physicalWindow}</strong><br>Bring: Original TC, all original certificates + 2 photocopies. Submit TC, collect acknowledgement receipt.<br>${p.consequence || ''}</span></div></div>` : `
        <div class="after-step"><div class="after-step-num">4</div><div><strong>Phase 1: Physical Reporting Optional</strong><br><span>You don't need to physically go to the college after Phase 1 allotment. Self-reporting is sufficient to secure your seat.</span></div></div>`}
        <div class="after-step"><div class="after-step-num">5</div><div><strong>Upgrade or Stay</strong><br><span>${p.cancellation}</span></div></div>
      </div>
    </div>`;

  container.innerHTML = `
    <div class="after-allotment-layout">
      <div class="after-allotment-current glass-panel">
        <h3 class="panel-subtitle">What to Do After Getting Allotted</h3>
        <p class="panel-description">Follow these steps in order. Missing any step can result in seat cancellation.</p>
        ${phaseHTML(activePhase)}
        <div class="after-classes-note">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span>Classes commence <strong>August 1, 2026</strong> (AICTE Academic Calendar 2026-27).</span>
        </div>
      </div>
      <div class="after-allotment-all-phases glass-panel">
        <h3 class="panel-subtitle">All Phase Timelines</h3>
        <p class="panel-description">Reference for all three phases.</p>
        ${phases.map(phaseHTML).join('')}
        <div class="after-sliding-note glass-panel" style="margin-top:12px;padding:12px 14px">
          <strong style="font-size:12px;color:var(--secondary)">Internal Sliding (Aug 12–13)</strong>
          <p style="font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.5">Already have a seat? Slide to a different branch within the same college. Fee reimbursement still applies. If you cancel after sliding, your seat goes to ECET lateral entry — NOT spot admissions.</p>
        </div>
        <div class="after-sliding-note glass-panel" style="margin-top:8px;padding:12px 14px">
          <strong style="font-size:12px;color:var(--reach-color)">Spot Admissions (from Aug 16)</strong>
          <p style="font-size:12px;color:var(--text-secondary);margin-top:4px;line-height:1.5">Offline, college-level walk-in admissions for leftover seats. Bring all original certificates. Fees at spot admissions may differ. Guidelines published at tgeapcet.nic.in.</p>
        </div>
      </div>
    </div>`;
}

// ── Info Hub ───────────────────────────────────────────────────
function renderInfoHub() {
  const container = document.getElementById('info-hub-content');
  if (!container) return;

  container.innerHTML = `
    <div class="info-hub-layout">

      <!-- Quota Types -->
      <div class="info-section glass-panel">
        <h3 class="info-section-title">📊 Seat Quota Types Explained</h3>
        <div class="quota-grid">
          <div class="quota-card convener">
            <div class="quota-card-header">Convener Quota</div>
            <div class="quota-pct">70%</div>
            <p>Filled through official TGEAPCET counselling on <a href="https://tgeapcet.nic.in" target="_blank" rel="noopener">tgeapcet.nic.in</a>. Fees are regulated by the government. Fee reimbursement applies here. This is what this app helps you with.</p>
          </div>
          <div class="quota-card management">
            <div class="quota-card-header">Management Quota</div>
            <div class="quota-pct">30%</div>
            <p>Filled directly by the college. Fees are higher (typically 2–3× convener fee). No fee reimbursement. Requires a separate college-level application. Contact the college admissions office directly.</p>
          </div>
          <div class="quota-card nri">
            <div class="quota-card-header">NRI Quota</div>
            <div class="quota-pct">~5% of MQ</div>
            <p>A small share within Management Quota for NRI students or children of NRIs. Fees are typically in USD/USD-equivalent. Governed by separate guidelines.</p>
          </div>
        </div>
        <p class="info-note">Note: All cutoff ranks in this app are for <strong>Convener Quota</strong> only. Management quota seats may be available at even "Reach" colleges if you apply directly.</p>
      </div>

      <!-- Local vs Non-Local -->
      <div class="info-section glass-panel">
        <h3 class="info-section-title">📍 Local vs Non-Local Eligibility</h3>
        <div class="local-cards">
          <div class="local-card ou-local">
            <div class="local-card-title">OU Area Local (85% of seats)</div>
            <p>You qualify as OU Local if you studied in OU jurisdiction districts (Hyderabad, Rangareddy, Medchal-Malkajgiri, Vikarabad, Yadadri-Bhuvanagiri, Sangareddy, Medak, Nizamabad, Jagtial, Rajanna Sircilla, Kamareddy, Nirmal, Adilabad, Mancherial, Kumuram Bheem, etc.) for at least 7 of the last 10 years — OR your parents have resided there for 10+ years.</p>
          </div>
          <div class="local-card non-local">
            <div class="local-card-title">Non-Local (15% unreserved seats)</div>
            <p>If you studied in Telangana but outside OU area, or if you're a TS local but moved recently. Non-locals compete for 15% unreserved seats across all colleges. In practice you can still get good colleges at high ranks.</p>
          </div>
        </div>
        <div class="info-tip">
          <strong>Tip:</strong> If you're non-local but your parent is in TS State/Central Government employment within the state, you qualify as local. Check G.O.Ms.No.15 HE Dept, 27-02-2025 for full eligibility criteria.
        </div>
      </div>

      <!-- Special Categories -->
      <div class="info-section glass-panel">
        <h3 class="info-section-title">🎖 Special Category Candidates</h3>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">These candidates MUST attend HLC at <strong>Government Polytechnic, Masabtank, Hyderabad</strong> only — NOT any other HLC.</p>
        <div class="special-cat-grid">
          <div class="special-cat-card">
            <div class="scat-icon">🎖</div>
            <strong>NCC</strong>
            <p>National Cadet Corps certificate holders. Specific allocation quota under special category.</p>
          </div>
          <div class="special-cat-card">
            <div class="scat-icon">♿</div>
            <strong>PHC</strong>
            <p>Physically Handicapped / Differently Abled. 3% horizontal reservation across all categories.</p>
          </div>
          <div class="special-cat-card">
            <div class="scat-icon">⚔️</div>
            <strong>CAP</strong>
            <p>Children of Armed Forces Personnel (Army/Navy/Air Force). Specific category with horizontal reservation.</p>
          </div>
          <div class="special-cat-card">
            <div class="scat-icon">🏅</div>
            <strong>Sports (SG)</strong>
            <p>State/National level sports achievers. Certificate from Sports Authority required.</p>
          </div>
          <div class="special-cat-card">
            <div class="scat-icon">🇮🇳</div>
            <strong>Anglo-Indian (ANG)</strong>
            <p>Anglo-Indian community candidates. Specific provision under Special Category.</p>
          </div>
        </div>
        <div class="info-tip">All above categories: Register at <a href="https://tgeapcet.nic.in" target="_blank" rel="noopener">tgeapcet.nic.in</a> and select Government Polytechnic, Masabtank as your HLC slot.</div>
      </div>

      <!-- Minority Candidates -->
      <div class="info-section glass-panel">
        <h3 class="info-section-title">🕌 Minority Candidates (Muslim / Christian)</h3>
        <div class="minority-info-card">
          <p><strong>Qualified in TGEAPCET-2026:</strong> You participate in regular counselling like all other candidates, with priority given to qualified minority candidates for seats in minority colleges.</p>
          <br>
          <p><strong>NOT Qualified / NOT Appeared in TGEAPCET-2026 (MPC Stream):</strong> You can still apply for <em>leftover seats</em> in respective minority colleges after all qualified minority candidates are exhausted — provided you have 45% (OC) or 40% (others) in Intermediate MPC.</p>
          <br>
          <div class="minority-warning">⚠ Fee Reimbursement does NOT apply to non-qualified minority candidates admitted under this pathway. Visit <a href="https://tgeapcet.nic.in" target="_blank" rel="noopener">tgeapcet.nic.in</a> for the procedure.</div>
        </div>
      </div>

      <!-- Seat Upgrade & Cancellation Policy -->
      <div class="info-section glass-panel">
        <h3 class="info-section-title">🔄 Seat Upgrade & Cancellation Policy</h3>
        <div class="policy-faq">
          <div class="faq-item">
            <div class="faq-q">Can I participate in Phase 2 if I already got a Phase 1 seat?</div>
            <div class="faq-a">Yes. But if Phase 2 gives you a new allotment, your Phase 1 seat is automatically cancelled. You MUST physically report after Phase 2 allotment.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">What if I don't pay the tuition fee after allotment?</div>
            <div class="faq-a">Your allotted seat is automatically cancelled. The fee payment window is strict — typically 4 days. No extensions normally granted.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Can I cancel voluntarily and get a refund?</div>
            <div class="faq-a">You can cancel up to the last cancellation date (July 28 for Phase 2). Processing fee of ₹600–₹1200 is non-refundable. Tuition fee refund policy depends on timing — see the official schedule.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">After Final Phase — can I cancel?</div>
            <div class="faq-a no">No. Dropouts/cancellations are NOT permitted after Final Phase allotment. If you leave, that seat goes to ECET Lateral Entry — not back to counselling or spot admissions.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">What is Internal Sliding?</div>
            <div class="faq-a">After Final Phase, if you want a different branch within the SAME college, you can participate in Internal Sliding (Aug 12–13). Fee reimbursement still applies to slided seats.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">What is the Processing Fee and is it refundable?</div>
            <div class="faq-a">Processing fee is ₹1,200 for OC/BC/EWS/Minority and ₹600 for SC/ST. It is paid once at the time of slot booking and is NON-REFUNDABLE regardless of whether you get a seat.</div>
          </div>
        </div>
      </div>

      <!-- Eligibility Quick Check -->
      <div class="info-section glass-panel">
        <h3 class="info-section-title">✅ Key Eligibility Requirements</h3>
        <div class="eligibility-checklist">
          <div class="elig-item"><span class="elig-icon">✓</span><div><strong>Minimum Marks in MPC</strong><br>OC / EWS: ≥45% in group subjects of Intermediate (Physics, Chemistry, Maths). BC / SC / ST / Others: ≥40%.</div></div>
          <div class="elig-item"><span class="elig-icon">✓</span><div><strong>Age Requirement</strong><br>Must have completed 16 years as on 31-12-2026 for B.Tech / Pharmacy. 17 years for Pharm D.</div></div>
          <div class="elig-item"><span class="elig-icon">✓</span><div><strong>Indian National</strong><br>Candidate must be an Indian National. NRI students apply separately under NRI quota through management quota pathway.</div></div>
          <div class="elig-item"><span class="elig-icon">✓</span><div><strong>TS Study Record (for fee reimbursement)</strong><br>Must have studied in Telangana for at least 4 of the last 7 years to claim fee reimbursement.</div></div>
          <div class="elig-item"><span class="elig-icon">✓</span><div><strong>Processing Fee Payment</strong><br>Must pay processing fee (₹1200 or ₹600 for SC/ST) at <a href="https://tgeapcet.nic.in" target="_blank" rel="noopener">tgeapcet.nic.in</a> before slot booking.</div></div>
        </div>
      </div>

    </div>
  `;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Utility ────────────────────────────────────────────────────
function cleanInt(val) {
  if (!val && val !== 0) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

// ── User Guide ─────────────────────────────────────────────────
function initUserGuide() {
  const modal       = document.getElementById('user-guide-modal');
  const openBtn     = document.getElementById('btn-open-user-guide');
  const closeBtn    = document.getElementById('btn-close-user-guide');
  const gotItBtn    = document.getElementById('btn-guide-got-it');
  const noShowCheck = document.getElementById('guide-dont-show-again');
  const newBadge    = document.getElementById('guide-new-badge');

  const STORAGE_KEY    = 'eapcet_guide_seen';
  const NO_SHOW_KEY    = 'eapcet_guide_no_show';
  const hasSeen        = localStorage.getItem(STORAGE_KEY);
  const noShowEnabled  = localStorage.getItem(NO_SHOW_KEY) === '1';

  function openGuide() {
    modal.classList.add('open');
    localStorage.setItem(STORAGE_KEY, '1');
    if (newBadge) newBadge.style.display = 'none';
    localStorage.removeItem('eapcet_guide_new');
  }

  function closeGuide() {
    if (noShowCheck && noShowCheck.checked) {
      localStorage.setItem(NO_SHOW_KEY, '1');
    }
    modal.classList.remove('open');
  }

  openBtn.addEventListener('click', openGuide);
  closeBtn.addEventListener('click', closeGuide);
  gotItBtn.addEventListener('click', closeGuide);

  modal.addEventListener('click', e => { if (e.target === modal) closeGuide(); });

  // Sync checkbox state from storage
  if (noShowCheck && noShowEnabled) noShowCheck.checked = true;

  // Auto-open on first visit, respect no-show preference
  // Skip if setup wizard is showing (wizard handles the first-visit flow)
  if (!hasSeen && !noShowEnabled && !window.__wzActive) {
    setTimeout(openGuide, 600);
  }

  // Hide NEW badge if already seen
  if (hasSeen && newBadge) {
    newBadge.style.display = 'none';
  }
}

// ── Setup Wizard (first-time onboarding) ──────────────────────
function initSetupWizard() {
  const SETUP_KEY  = 'eapcet_setup_done_v1';
  const wizard     = document.getElementById('setup-wizard');
  if (!wizard) return;

  if (localStorage.getItem(SETUP_KEY)) {
    wizard.remove();
    return;
  }

  // Signal to initUserGuide not to auto-open
  window.__wzActive = true;

  wizard.classList.add('open');

  // ── Rank/Marks toggle inside wizard ──
  let wzRankMode = 'rank';
  document.getElementById('wz-mode-rank').addEventListener('click', () => {
    wzRankMode = 'rank';
    document.getElementById('wz-mode-rank').classList.add('active');
    document.getElementById('wz-mode-marks').classList.remove('active');
    document.getElementById('wz-group-rank').classList.remove('hidden');
    document.getElementById('wz-group-marks').classList.add('hidden');
    document.getElementById('wz-err-1').classList.remove('visible');
  });
  document.getElementById('wz-mode-marks').addEventListener('click', () => {
    wzRankMode = 'marks';
    document.getElementById('wz-mode-marks').classList.add('active');
    document.getElementById('wz-mode-rank').classList.remove('active');
    document.getElementById('wz-group-marks').classList.remove('hidden');
    document.getElementById('wz-group-rank').classList.add('hidden');
    document.getElementById('wz-err-1').classList.remove('visible');
  });

  // ── Step transition ──
  function goTo(targetStep, direction) {
    const current = wizard.querySelector('.wz-step.active');
    const next    = document.getElementById(`wz-step-${targetStep}`);
    if (!next || current === next) return;

    const dx = direction === 'back' ? 24 : -24;

    current.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    current.style.opacity    = '0';
    current.style.transform  = `translateX(${dx}px)`;

    setTimeout(() => {
      current.classList.remove('active');
      current.style.cssText = '';

      next.style.cssText  = `opacity:0;transform:translateX(${-dx}px);transition:none;display:flex`;
      next.offsetHeight;  // force reflow
      next.style.cssText  = 'transition:opacity 0.22s ease,transform 0.22s ease;display:flex';
      next.style.opacity   = '1';
      next.style.transform = 'translateX(0)';
      next.classList.add('active');

      setTimeout(() => { next.style.cssText = ''; }, 240);
    }, 215);
  }

  // ── Close wizard ──
  function closeWizard(completed) {
    window.__wzActive = false;
    wizard.style.transition = 'opacity 0.3s ease';
    wizard.style.opacity    = '0';
    setTimeout(() => wizard.remove(), 310);

    if (completed) {
      localStorage.setItem(SETUP_KEY, '1');
      // Suppress guide auto-open on first-time completion (don't overwhelm)
      localStorage.setItem('eapcet_guide_seen', '1');
    } else {
      localStorage.setItem(SETUP_KEY, '1'); // skipped — don't show again
    }
  }

  // ── Apply profile to sidebar ──
  function applyProfile() {
    // Rank / Marks
    if (wzRankMode === 'rank') {
      const val = document.getElementById('wz-rank').value;
      if (val) {
        document.getElementById('mode-rank-btn').click();
        const el = document.getElementById('student-rank');
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      const val = document.getElementById('wz-marks').value;
      if (val) {
        document.getElementById('mode-marks-btn').click();
        const el = document.getElementById('student-marks');
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Gender
    const genderVal = document.querySelector('input[name="wz-gender"]:checked')?.value || 'BOYS';
    document.querySelectorAll('input[name="gender"]').forEach(r => {
      if (r.value === genderVal) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    });

    // Category
    const catEl  = document.getElementById('student-category');
    catEl.value  = document.getElementById('wz-category').value;
    catEl.dispatchEvent(new Event('change', { bubbles: true }));

    // Region
    const regEl  = document.getElementById('student-region');
    regEl.value  = document.getElementById('wz-region').value;
    regEl.dispatchEvent(new Event('change', { bubbles: true }));

    // Income
    const incomeVal = document.querySelector('input[name="wz-income"]:checked')?.value || 'below';
    document.querySelectorAll('input[name="income"]').forEach(r => {
      if (r.value === incomeVal) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    });

    // TS Study
    const tsEl   = document.getElementById('ts-study-record');
    tsEl.checked = document.getElementById('wz-ts-study').checked;
    tsEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ── Nav: Welcome ──
  document.getElementById('wz-start').addEventListener('click', () => goTo(1, 'forward'));
  document.getElementById('wz-skip').addEventListener('click',  () => closeWizard(false));

  // ── Nav: Step 1 ──
  document.getElementById('wz-back-1').addEventListener('click', () => goTo(0, 'back'));
  document.getElementById('wz-next-1').addEventListener('click', () => {
    const rankVal  = document.getElementById('wz-rank').value;
    const marksVal = document.getElementById('wz-marks').value;
    const errEl    = document.getElementById('wz-err-1');
    if (!rankVal && !marksVal) {
      errEl.classList.add('visible');
      return;
    }
    errEl.classList.remove('visible');
    goTo(2, 'forward');
  });

  // ── Nav: Step 2 ──
  document.getElementById('wz-back-2').addEventListener('click', () => goTo(1, 'back'));
  document.getElementById('wz-next-2').addEventListener('click', () => goTo(3, 'forward'));

  // ── Nav: Step 3 ──
  document.getElementById('wz-back-3').addEventListener('click', () => goTo(2, 'back'));
  document.getElementById('wz-finish').addEventListener('click', () => {
    applyProfile();
    closeWizard(true);
    updateMobileProfileBar();
  });
}

// ── Mobile Responsive Layer ────────────────────────────────────

/* Update the compact profile chips in the mobile summary bar */
function updateMobileProfileBar() {
  if (window.innerWidth > 768) return;

  const IC = {
    rank:     `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" style="flex-shrink:0"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
    gender:   `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" style="flex-shrink:0"><circle cx="12" cy="11" r="4"/><path d="M12 15v6M9 18h6"/></svg>`,
    category: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" style="flex-shrink:0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    region:   `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" style="flex-shrink:0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    income:   `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" style="flex-shrink:0"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
  };

  const rankChip = document.getElementById('chip-rank');
  if (rankChip) {
    if (state.studentRank) {
      rankChip.innerHTML = `${IC.rank} #${state.studentRank.toLocaleString()}`;
      rankChip.classList.remove('empty-rank');
    } else {
      rankChip.innerHTML = `${IC.rank} Set Rank`;
      rankChip.classList.add('empty-rank');
    }
  }

  const genderMap = { GENERAL: 'All', BOYS: 'Boys', GIRLS: 'Girls' };
  const genderChip = document.getElementById('chip-gender');
  if (genderChip) genderChip.innerHTML = `${IC.gender} ${genderMap[state.gender] || state.gender}`;

  const catChip = document.getElementById('chip-category');
  if (catChip) catChip.innerHTML = `${IC.category} ${(state.category || 'OC').replace('_', '-')}`;

  const regChip = document.getElementById('chip-region');
  if (regChip) regChip.innerHTML = `${IC.region} ${state.region === 'OU' ? 'OU' : 'Non-Local'}`;

  const incomeMap = { below: '< ₹2L', above: '₹2–8L', high: '> ₹8L' };
  const incomeChip = document.getElementById('chip-income');
  if (incomeChip) incomeChip.innerHTML = `${IC.income} ${incomeMap[state.incomeLevel] || '< ₹2L'}`;
}

/* Show/hide the right FAB bar based on the current active tab */
function updateFabBar() {
  const isMobile = window.innerWidth <= 768;
  const simulatorFab = document.getElementById('fab-bar-simulator');
  if (!simulatorFab) return;
  simulatorFab.classList.remove('fab-visible');
  simulatorFab.setAttribute('aria-hidden', 'true');
  if (!isMobile) return;
  if (state.activeTab === 'option-simulator') {
    simulatorFab.classList.add('fab-visible');
    simulatorFab.setAttribute('aria-hidden', 'false');
  }
}

/* Wire FAB buttons to the same actions as the buried desktop buttons */
function initFabBar() {
  // FAB: Simulate Allotment (mirrors #btn-simulate-allotment)
  document.getElementById('fab-simulate-allotment')?.addEventListener('click', () => {
    document.getElementById('btn-simulate-allotment')?.click();
  });
}

/* Mobile "Filters" toggle: collapse/expand the advanced filter row.
   On ≤768px the section becomes a fixed bottom sheet with a backdrop. */
function initMobileFiltersToggle() {
  const toggleBtn = document.getElementById('mobile-filters-toggle');
  const section   = document.getElementById('advanced-filters-section');
  const closeBtn  = document.getElementById('filter-sheet-close');
  if (!toggleBtn || !section) return;

  // Create backdrop element once
  let backdrop = document.getElementById('filter-sheet-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'filter-sheet-backdrop';
    backdrop.className = 'filter-sheet-backdrop';
    // Append inside .main-panel so it shares the same stacking context
    // as the filter sheet (both inside .app-container z-index:1).
    // Appending to body would put it in the root stacking context where
    // z-index:299 > app-container z-index:1, covering the filter sheet.
    (document.querySelector('.main-panel') || document.body).appendChild(backdrop);
  }

  const openFilters = () => {
    section.classList.add('filters-open');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    const label = document.getElementById('mobile-filters-toggle-label');
    if (label) label.textContent = 'Hide Filters';
    if (window.innerWidth <= 768) backdrop.classList.add('visible');
  };

  const closeFilters = () => {
    section.classList.remove('filters-open');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    const label = document.getElementById('mobile-filters-toggle-label');
    if (label) label.textContent = 'Filters';
    backdrop.classList.remove('visible');
  };

  toggleBtn.addEventListener('click', () => {
    section.classList.contains('filters-open') ? closeFilters() : openFilters();
  });

  // Close via backdrop tap or the in-sheet ✕ button
  backdrop.addEventListener('click', closeFilters);
  closeBtn?.addEventListener('click', closeFilters);

  // Close sheet on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) backdrop.classList.remove('visible');
  }, { passive: true });
}

/* Chips: tap any chip to open the profile drawer */
function initProfileChipTap() {
  const bar    = document.getElementById('mobile-profile-bar');
  const toggle = document.getElementById('sidebar-mobile-toggle');
  if (!bar || !toggle) return;

  bar.addEventListener('click', (e) => {
    if (window.innerWidth > 768) return;
    e.stopPropagation(); // prevent main-panel click listener from closing drawer immediately
    toggle.click();
  });
}

/* Main init function for all mobile responsive enhancements */
function initMobileResponsive() {
  initFabBar();
  initMobileFiltersToggle();
  initProfileChipTap();

  // Initial state sync
  updateMobileProfileBar();
  updateFabBar();

  // Re-evaluate FAB and chips on resize
  window.addEventListener('resize', () => {
    updateFabBar();
    updateMobileProfileBar();
  }, { passive: true });
}
