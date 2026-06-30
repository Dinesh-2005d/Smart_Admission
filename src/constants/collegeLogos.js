// src/constants/collegeLogos.js
// ── Logo resolution priority ──────────────────────────────────────────────────
//  1. COLLEGE_LOGO_DIRECT  – real logo image from Wikipedia / official site
//  2. COLLEGE_LOGOS        – Clearbit Logo API (fetches from college website)
//  3. Google Favicon API   – sz=128 thumbnail (derived from Clearbit domain)
//  4. Styled initials badge (offline, always works)

// Helper: Wikipedia Special:Redirect turns SVG → PNG at a given width.
// React Native Image follows the redirect and displays the real college logo.
const W = (filename) =>
  `https://en.wikipedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(filename)}&width=200`;

// Helper: Wikimedia Commons version (for logos hosted on Commons, not English Wikipedia)
const WC = (filename) =>
  `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(filename)}&width=200`;

// ── TIER-1: Direct real logo URLs (Wikipedia/official sources) ────────────────
export const COLLEGE_LOGO_DIRECT = {

  // ── IITs ──────────────────────────────────────────────────────────────────
  'IIT Madras':              W('IIT_Madras_Logo.svg'),
  'IIT Bombay':              W('IIT_Bombay_Logo.svg'),
  'IIT Delhi':               W('IIT_Delhi_Logo.svg'),
  'IIT Kharagpur':           W('IIT_Kharagpur_Logo.svg'),
  'IIT Kanpur':              W('IITK_logo.png'),
  'IIT Roorkee':             W('IIT_Roorkee_logo.png'),
  'IIT Guwahati':            W('IIT_Guwahati_Logo.png'),
  'IIT Hyderabad':           W('IIT_Hyderabad_Logo.png'),
  'IIT BHU Varanasi':        W('IIT_BHU_Varanasi_logo.png'),
  'IIT Gandhinagar':         W('IIT_Gandhinagar_Logo.png'),
  'IIT Jodhpur':             W('IIT_Jodhpur_Logo.png'),
  'IIT Indore':              W('IIT_Indore_logo.png'),
  'IIT Mandi':               W('IIT_Mandi_Logo.png'),
  'IIT Bhubaneswar':         W('IIT_Bhubaneswar_logo.png'),
  'IIT Patna':               W('IIT_Patna_Logo.png'),
  'IIT Ropar':               W('IIT_Ropar_Logo.png'),
  'IIT (ISM) Dhanbad':       W('ISM_Dhanbad_logo.png'),
  'IIT Dharwad':             W('IIT_Dharwad_logo.png'),

  // ── NITs ──────────────────────────────────────────────────────────────────
  'NIT Trichy':              W('NIT_Trichy_Logo.png'),
  'NIT Warangal':            W('NIT_Warangal_Logo.png'),
  'NITK Surathkal':          W('NITK_Surathkal_logo.png'),
  'NIT Calicut':             W('NIT_Calicut_logo.png'),
  'NIT Rourkela':            W('NIT_Rourkela_logo.png'),
  'NIT Durgapur':            W('NIT_Durgapur_Logo.png'),
  'NIT Silchar':             W('NIT_Silchar_Logo.png'),
  'NIT Surat (SVNIT)':       W('SVNIT_logo.png'),
  'MNIT Jaipur':             W('MNIT_Jaipur_logo.png'),
  'NIT Kurukshetra':         W('NIT_Kurukshetra_logo.png'),
  'MANIT Bhopal':            W('MANIT_Bhopal_logo.png'),
  'NIT Raipur':              W('NIT_Raipur_logo.png'),
  'NIT Patna':               W('NIT_Patna_logo.png'),
  'NIT Jamshedpur':          W('NIT_Jamshedpur_logo.png'),
  'NIT Goa':                 W('NIT_Goa_logo.png'),
  'NIT Hamirpur':            W('NIT_Hamirpur_logo.png'),
  'NIT Uttarakhand':         W('NIT_Uttarakhand_logo.png'),
  'NIT Andhra Pradesh':      W('NIT_Andhra_Pradesh_logo.png'),

  // ── AIIMS ─────────────────────────────────────────────────────────────────
  'AIIMS New Delhi':         W('AIIMS_New_Delhi_Logo.png'),
  'AIIMS Bhopal':            W('AIIMS_Bhopal_Logo.png'),
  'AIIMS Bhubaneswar':       W('AIIMS_Bhubaneswar_logo.png'),
  'AIIMS Raipur':            W('AIIMS_Raipur_logo.png'),
  'AIIMS Patna':             W('AIIMS_Patna_logo.png'),
  'AIIMS Jodhpur':           W('AIIMS_Jodhpur_logo.png'),

  // ── Tamil Nadu ────────────────────────────────────────────────────────────
  'Anna University (CEG)':                   W('Anna_university_logo.png'),
  'VIT Vellore':                             W('VIT_University_Logo.png'),
  'SRM Institute of Science and Technology': W('SRM_Institute_of_Science_and_Technology_logo.png'),
  'PSG College of Technology':               W('PSG_College_of_Technology_Logo.png'),
  'Christian Medical College (CMC)':         WC('CMC_Vellore_Coat_of_Arms.png'),
  'Madras Medical College':                  W('Madras_Medical_College_logo.png'),
  'Sri Ramachandra Institute of Higher Education': W('Sri_Ramachandra_Institute_logo.png'),
  'Tamil Nadu Agricultural University (TNAU)': W('TNAU_logo.png'),
  'Coimbatore Institute of Technology':      W('Coimbatore_Institute_of_Technology_logo.png'),
  'Thiagarajar College of Engineering':      W('Thiagarajar_College_of_Engineering_logo.png'),
  'GCT Coimbatore (Government College of Technology)': W('Government_College_of_Technology,_Coimbatore_logo.png'),
  'SSN College of Engineering':              W('SSN_Institutions_Logo.png'),
  'Stanley Medical College':                 W('Stanley_Medical_College_Logo.png'),
  'Kilpauk Medical College':                 W('Kilpauk_Medical_College_logo.png'),
  'Annamalai University (Faculty of Agriculture)': W('Annamalai_University_logo.png'),

  // ── Maharashtra ───────────────────────────────────────────────────────────
  'College of Engineering Pune (COEP)':      W('College_of_Engineering_Pune_Logo.png'),
  'VJTI':                                    W('VJTI_logo.png'),
  'Institute of Chemical Technology (ICT)':  W('Institute_of_Chemical_Technology_Mumbai_logo.png'),
  'Symbiosis Institute of Technology':       W('Symbiosis_International_University_logo.png'),
  'Seth GS Medical College & KEM Hospital':  W('Seth_GS_Medical_College_and_KEM_Hospital_logo.png'),
  'Grant Medical College':                   W('Grant_Medical_College_and_Sir_Jamshedjee_Jeejeebhoy_Group_of_Hospitals_logo.png'),
  'B.J. Medical College':                    W('B._J._Medical_College_logo.png'),
  'Mahatma Phule Krishi Vidyapeeth (MPKV)':  W('Mahatma_Phule_Krishi_Vidyapeeth_logo.png'),
  'Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV)': W('Dr._Panjabrao_Deshmukh_Krishi_Vidyapeeth_logo.png'),

  // ── Delhi ─────────────────────────────────────────────────────────────────
  'Delhi Technological University (DTU)':    W('DTU_Delhi_logo.png'),
  'Netaji Subhas University of Technology (NSUT)': W('NSUT_Delhi_logo.png'),
  'Indian Agricultural Research Institute (IARI)': W('IARI_logo.png'),

  // ── Karnataka ─────────────────────────────────────────────────────────────
  'BMS College of Engineering':              W('BMS_College_of_Engineering_Logo.png'),
  'RV College of Engineering':               W('RV_College_of_Engineering_logo.png'),
  'PES University':                          W('PES_University_logo.png'),
  'University of Agricultural Sciences (UAS)': W('University_of_Agricultural_Sciences,_Bangalore_logo.png'),

  // ── Telangana / AP ────────────────────────────────────────────────────────
  'Osmania University':                      W('Osmania_University_Logo.png'),
  'JNTU Hyderabad':                          W('Jawaharlal_Nehru_Technological_University_logo.png'),
  'Andhra University':                       W('Andhra_University_logo.png'),
  'Professor Jayashankar Telangana State Agricultural University': W('Professor_Jayashankar_Telangana_State_Agricultural_University_logo.png'),
  'RGUKT (IIIT Srikakulam)':                 W('Rajiv_Gandhi_University_of_Knowledge_Technologies_logo.png'),

  // ── Kerala ────────────────────────────────────────────────────────────────
  'College of Engineering Trivandrum (CET)': W('College_of_Engineering,_Trivandrum_logo.png'),
  'Government Medical College Thiruvananthapuram': W('Government_Medical_College,_Thiruvananthapuram_logo.png'),
  'Kerala Agricultural University (KAU)':    W('Kerala_Agricultural_University_logo.png'),

  // ── Gujarat ───────────────────────────────────────────────────────────────
  'MS University Baroda (Faculty of Technology)': W('Maharaja_Sayajirao_University_of_Baroda_Logo.png'),
  'Anand Agricultural University':           W('Anand_Agricultural_University_logo.png'),

  // ── Rajasthan ─────────────────────────────────────────────────────────────
  'BITS Pilani':                             W('BITS_Pilani-Logo.svg'),
  'SMS Medical College':                     W('Sawai_Man_Singh_Medical_College_logo.png'),

  // ── West Bengal ───────────────────────────────────────────────────────────
  'Jadavpur University':                     W('Jadavpur_University_Logo.png'),
  'Medical College and Hospital Kolkata':    W('Medical_College_and_Hospital,_Kolkata_logo.png'),

  // ── Punjab ────────────────────────────────────────────────────────────────
  'Thapar Institute of Engineering and Technology': W('Thapar_University_logo.png'),

  // ── Uttar Pradesh ─────────────────────────────────────────────────────────
  'HBTU Kanpur':                             W('Harcourt_Butler_Technical_University_logo.png'),
  'KGMU (King George\'s Medical University)': W('KGMU_logo.png'),
  
  // ── Goa ───────────────────────────────────────────────────────────────────
  'Goa College of Engineering':              W('Goa_College_of_Engineering_logo.png'),

  // ── Extra Department Colleges ───────────────────────────────────────────────
  'Chanakya National Law University': W('Chanakya_National_Law_University_logo.png'),
  'Rajendra Agricultural University': W('Rajendra_Agricultural_University_logo.png'),
  'Architecture College Patna': W('Architecture_College_Patna_logo.png'),
  'IHM Patna': W('IHM_Patna_logo.png'),
  'Bihar Paramedical College': W('Bihar_Paramedical_College_logo.png'),
  'Government Polytechnic Patna': W('Government_Polytechnic_Patna_logo.png'),
  'Patna University': W('Patna_University_logo.png'),
  'Bihar College of Pharmacy': W('Bihar_College_of_Pharmacy_logo.png'),
  'IGIMS Nursing Patna': W('IGIMS_Nursing_Patna_logo.png'),
  'Patna University MBA': W('Patna_University_MBA_logo.png'),
  'Patna Teacher Training College': W('Patna_Teacher_Training_College_logo.png'),
  'Hidayatullah National Law University': W('Hidayatullah_National_Law_University_logo.png'),
  'Indira Gandhi Krishi Vishwavidyalaya': W('Indira_Gandhi_Krishi_Vishwavidyalaya_logo.png'),
  'CSVTU Architecture School': W('CSVTU_Architecture_School_logo.png'),
  'CG Institute of Management': W('CG_Institute_of_Management_logo.png'),
  'IHM Raipur': W('IHM_Raipur_logo.png'),
  'CG College of Education': W('CG_College_of_Education_logo.png'),
  'Raipur Paramedical Sciences': W('Raipur_Paramedical_Sciences_logo.png'),
  'Government Polytechnic Raipur': W('Government_Polytechnic_Raipur_logo.png'),
  'Pt. Ravishankar Shukla University': W('Pt_Ravishankar_Shukla_University_logo.png'),
  'NIT Arunachal Pradesh': W('NIT_Arunachal_Pradesh_logo.png'),
  'TRIHMS': W('TRIHMS_logo.png'),
  'Govt Nursing College Itanagar': W('Govt_Nursing_College_Itanagar_logo.png'),
  'APST Pharmacy College': W('APST_Pharmacy_College_logo.png'),
  'RGU Law School': W('RGU_Law_School_logo.png'),
  'College of Horticulture Pasighat': W('College_of_Horticulture_Pasighat_logo.png'),
  'RGU Architecture Dept': W('RGU_Architecture_Dept_logo.png'),
  'Arunachal University of Studies': W('Arunachal_University_of_Studies_logo.png'),
  'IHM Itanagar': W('IHM_Itanagar_logo.png'),
  'DIET Itanagar': W('DIET_Itanagar_logo.png'),
  'Arunachal Paramedical Institute': W('Arunachal_Paramedical_Institute_logo.png'),
  'Govt Polytechnic Itanagar': W('Govt_Polytechnic_Itanagar_logo.png'),
  'Rajiv Gandhi University': W('Rajiv_Gandhi_University_logo.png'),
  'IHM Guwahati': W('IHM_Guwahati_logo.png'),
  'IHM Ahmedabad': W('IHM_Ahmedabad_logo.png'),
  'CSK HPKV Palampur': W('CSK_HPKV_Palampur_logo.png'),
  'HP Institute of Architecture': W('HP_Institute_of_Architecture_logo.png'),
  'IHM Shimla': W('IHM_Shimla_logo.png'),
  'HP Paramedical Sciences': W('HP_Paramedical_Sciences_logo.png'),
  'Jawaharlal Nehru Krishi Vishwavidyalaya': W('Jawaharlal_Nehru_Krishi_Vishwavidyalaya_logo.png'),
  'MP Paramedical Sciences Institute': W('MP_Paramedical_Sciences_Institute_logo.png'),
  'Manipur Institute of Pharmacy': W('Manipur_Institute_of_Pharmacy_logo.png'),
  'NIT Manipur Architecture': W('NIT_Manipur_Architecture_logo.png'),
  'IHM Imphal': W('IHM_Imphal_logo.png'),
  'NEIGRIHMS School of Pharmacy': W('NEIGRIHMS_School_of_Pharmacy_logo.png'),
  'College of Agriculture Tura': W('College_of_Agriculture_Tura_logo.png'),
  'NEHU Architecture School': W('NEHU_Architecture_School_logo.png'),
  'IHM Shillong': W('IHM_Shillong_logo.png'),
  'Meghalaya Paramedical Institute': W('Meghalaya_Paramedical_Institute_logo.png'),
  'NIT Mizoram Architecture': W('NIT_Mizoram_Architecture_logo.png'),
  'Aizawl Business School': W('Aizawl_Business_School_logo.png'),
  'IHM Aizawl': W('IHM_Aizawl_logo.png'),
  'Nagaland Medical College': W('Nagaland_Medical_College_logo.png'),
  'Nagaland Institute of Pharmacy': W('Nagaland_Institute_of_Pharmacy_logo.png'),
  'Nagaland University Law School': W('Nagaland_University_Law_School_logo.png'),
  'College of Agriculture Medziphema': W('College_of_Agriculture_Medziphema_logo.png'),
  'NIT Nagaland Architecture': W('NIT_Nagaland_Architecture_logo.png'),
  'Nagaland Management Institute': W('Nagaland_Management_Institute_logo.png'),
  'IHM Kohima': W('IHM_Kohima_logo.png'),
  'Nagaland Paramedical Institute': W('Nagaland_Paramedical_Institute_logo.png'),
  'SMIMS Gangtok': W('SMIMS_Gangtok_logo.png'),
  'SIT Sikkim Architecture': W('SIT_Sikkim_Architecture_logo.png'),
  'Sikkim Manipal Institute of Management': W('Sikkim_Manipal_Institute_of_Management_logo.png'),
  'IHM Gangtok': W('IHM_Gangtok_logo.png'),
  'Sikkim Paramedical Institute': W('Sikkim_Paramedical_Institute_logo.png'),
  'IHM Chennai': W('IHM_Chennai_logo.png'),
  'IHM Hyderabad': W('IHM_Hyderabad_logo.png'),
  'NIT Agartala Architecture': W('NIT_Agartala_Architecture_logo.png'),
  'Tripura Management Institute': W('Tripura_Management_Institute_logo.png'),
  'IHM Agartala': W('IHM_Agartala_logo.png'),
  'Tripura Paramedical Institute': W('Tripura_Paramedical_Institute_logo.png'),
  'Uttarakhand High Court Law School': W('Uttarakhand_High_Court_Law_School_logo.png'),
  'DIT University Architecture': W('DIT_University_Architecture_logo.png'),
  'IHM Dehradun': W('IHM_Dehradun_logo.png'),
  'Bidhan Chandra Krishi Viswavidyalaya': W('Bidhan_Chandra_Krishi_Viswavidyalaya_logo.png'),
  'IHM Delhi': W('IHM_Delhi_logo.png'),
  'NIT Srinagar': W('NIT_Srinagar_logo.png'),
  'GMC Srinagar': W('GMC_Srinagar_logo.png'),
  'SKUAST Kashmir': W('SKUAST_Kashmir_logo.png'),
  'IHM Srinagar': W('IHM_Srinagar_logo.png'),
  'Govt Polytechnic Srinagar': W('Govt_Polytechnic_Srinagar_logo.png'),
  'Pondicherry University Pharmacy': W('Pondicherry_University_Pharmacy_logo.png'),
  'Pondicherry University Law': W('Pondicherry_University_Law_logo.png'),
  'Pondicherry Agriculture College': W('Pondicherry_Agriculture_College_logo.png'),
  'Pondicherry University Architecture': W('Pondicherry_University_Architecture_logo.png'),
  'Pondicherry University MBA': W('Pondicherry_University_MBA_logo.png'),
  'IHM Puducherry': W('IHM_Puducherry_logo.png'),
};

// ── TIER-2: Clearbit Logo API (fetches favicon/logo from official website) ────
export const COLLEGE_LOGOS = {
  // ── IITs ──────────────────────────────────────────────────────────────────
  'IIT Madras':                          'https://logo.clearbit.com/iitm.ac.in',
  'IIT Bombay':                          'https://logo.clearbit.com/iitb.ac.in',
  'IIT Delhi':                           'https://logo.clearbit.com/iitd.ac.in',
  'IIT Kharagpur':                       'https://logo.clearbit.com/iitkgp.ac.in',
  'IIT Kanpur':                          'https://logo.clearbit.com/iitk.ac.in',
  'IIT Roorkee':                         'https://logo.clearbit.com/iitr.ac.in',
  'IIT Guwahati':                        'https://logo.clearbit.com/iitg.ac.in',
  'IIT Hyderabad':                       'https://logo.clearbit.com/iith.ac.in',
  'IIT Dharwad':                         'https://logo.clearbit.com/iitdh.ac.in',
  'IIT Gandhinagar':                     'https://logo.clearbit.com/iitgn.ac.in',
  'IIT Jodhpur':                         'https://logo.clearbit.com/iitj.ac.in',
  'IIT BHU Varanasi':                    'https://logo.clearbit.com/iitbhu.ac.in',
  'IIT Indore':                          'https://logo.clearbit.com/iiti.ac.in',
  'IIT Mandi':                           'https://logo.clearbit.com/iitmandi.ac.in',
  'IIT Bhubaneswar':                     'https://logo.clearbit.com/iitbbs.ac.in',
  'IIT Patna':                           'https://logo.clearbit.com/iitp.ac.in',
  'IIT Ropar':                           'https://logo.clearbit.com/iitrpr.ac.in',
  'IIT (ISM) Dhanbad':                   'https://logo.clearbit.com/iitism.ac.in',

  // ── NITs ──────────────────────────────────────────────────────────────────
  'NIT Trichy':                          'https://logo.clearbit.com/nitt.edu',
  'NIT Warangal':                        'https://logo.clearbit.com/nitw.ac.in',
  'NITK Surathkal':                      'https://logo.clearbit.com/nitk.ac.in',
  'NIT Calicut':                         'https://logo.clearbit.com/nitc.ac.in',
  'NIT Rourkela':                        'https://logo.clearbit.com/nitrkl.ac.in',
  'NIT Durgapur':                        'https://logo.clearbit.com/nitdgp.ac.in',
  'NIT Silchar':                         'https://logo.clearbit.com/nits.ac.in',
  'NIT Surat (SVNIT)':                   'https://logo.clearbit.com/svnit.ac.in',
  'MNIT Jaipur':                         'https://logo.clearbit.com/mnit.ac.in',
  'NIT Kurukshetra':                     'https://logo.clearbit.com/nitkkr.ac.in',
  'MANIT Bhopal':                        'https://logo.clearbit.com/manit.ac.in',
  'NIT Raipur':                          'https://logo.clearbit.com/nitrr.ac.in',
  'NIT Patna':                           'https://logo.clearbit.com/nitp.ac.in',
  'NIT Andhra Pradesh':                  'https://logo.clearbit.com/nitandhra.ac.in',
  'NIT Jamshedpur':                      'https://logo.clearbit.com/nitjsr.ac.in',
  'NIT Goa':                             'https://logo.clearbit.com/nitgoa.ac.in',
  'NIT Hamirpur':                        'https://logo.clearbit.com/nith.ac.in',
  'NIT Uttarakhand':                     'https://logo.clearbit.com/nituk.ac.in',

  // ── AIIMS ─────────────────────────────────────────────────────────────────
  'AIIMS New Delhi':                     'https://logo.clearbit.com/aiims.edu',
  'AIIMS Bhopal':                        'https://logo.clearbit.com/aiimsbhopal.edu.in',
  'AIIMS Bhubaneswar':                   'https://logo.clearbit.com/aiimsbhubaneswar.nic.in',
  'AIIMS Raipur':                        'https://logo.clearbit.com/aiimsraipur.edu.in',
  'AIIMS Patna':                         'https://logo.clearbit.com/aiimspatna.edu.in',
  'AIIMS Jodhpur':                       'https://logo.clearbit.com/aiimsjodhpur.edu.in',

  // ── Tamil Nadu ────────────────────────────────────────────────────────────
  'Anna University (CEG)':               'https://logo.clearbit.com/annauniv.edu',
  'VIT Vellore':                         'https://logo.clearbit.com/vit.ac.in',
  'SRM Institute of Science and Technology': 'https://logo.clearbit.com/srmist.edu.in',
  'PSG College of Technology':           'https://logo.clearbit.com/psgtech.ac.in',
  'SSN College of Engineering':          'https://logo.clearbit.com/ssnce.ac.in',
  'Coimbatore Institute of Technology':  'https://logo.clearbit.com/cit.edu.in',
  'Thiagarajar College of Engineering':  'https://logo.clearbit.com/tce.edu',
  'GCT Coimbatore (Government College of Technology)': 'https://logo.clearbit.com/gct.ac.in',
  'Christian Medical College (CMC)':     'https://logo.clearbit.com/cmch-vellore.edu',
  'Madras Medical College':              'https://logo.clearbit.com/mmc.ac.in',
  'Stanley Medical College':             'https://logo.clearbit.com/stanleymedicalcollege.com',
  'Kilpauk Medical College':             'https://logo.clearbit.com/tnmgrmu.ac.in',
  'Sri Ramachandra Institute of Higher Education': 'https://logo.clearbit.com/sriramachandra.edu.in',
  'Tamil Nadu Agricultural University (TNAU)': 'https://logo.clearbit.com/tnau.ac.in',
  'Annamalai University (Faculty of Agriculture)': 'https://logo.clearbit.com/annamalaiuniversity.ac.in',

  // ── Maharashtra ───────────────────────────────────────────────────────────
  'College of Engineering Pune (COEP)':  'https://logo.clearbit.com/coeptech.ac.in',
  'VJTI':                                'https://logo.clearbit.com/vjti.ac.in',
  'Institute of Chemical Technology (ICT)': 'https://logo.clearbit.com/ictmumbai.edu.in',
  'Symbiosis Institute of Technology':   'https://logo.clearbit.com/sitpune.edu.in',
  'Seth GS Medical College & KEM Hospital': 'https://logo.clearbit.com/kem.edu',
  'Grant Medical College':               'https://logo.clearbit.com/grantmedicalcollege.org',
  'B.J. Medical College':                'https://logo.clearbit.com/bjmcpune.com',
  'Mahatma Phule Krishi Vidyapeeth (MPKV)': 'https://logo.clearbit.com/mpkv.ac.in',
  'Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV)': 'https://logo.clearbit.com/pdkv.ac.in',

  // ── Delhi ─────────────────────────────────────────────────────────────────
  'Delhi Technological University (DTU)':'https://logo.clearbit.com/dtu.ac.in',
  'Netaji Subhas University of Technology (NSUT)': 'https://logo.clearbit.com/nsut.ac.in',
  'Indian Agricultural Research Institute (IARI)': 'https://logo.clearbit.com/iari.res.in',

  // ── Karnataka ─────────────────────────────────────────────────────────────
  'BMS College of Engineering':          'https://logo.clearbit.com/bmsce.ac.in',
  'PES University':                      'https://logo.clearbit.com/pes.edu',
  'RV College of Engineering':           'https://logo.clearbit.com/rvce.ac.in',
  'University of Agricultural Sciences (UAS)': 'https://logo.clearbit.com/uasbangalore.edu.in',

  // ── Telangana / Andhra Pradesh ────────────────────────────────────────────
  'Osmania University':                  'https://logo.clearbit.com/osmania.ac.in',
  'JNTU Hyderabad':                      'https://logo.clearbit.com/jntuh.ac.in',
  'Andhra University':                   'https://logo.clearbit.com/andhrauniversity.edu.in',
  'RGUKT (IIIT Srikakulam)':             'https://logo.clearbit.com/rgukt.in',

  // ── Kerala ────────────────────────────────────────────────────────────────
  'College of Engineering Trivandrum (CET)': 'https://logo.clearbit.com/cet.ac.in',
  'Government Medical College Thiruvananthapuram': 'https://logo.clearbit.com/gmctvm.edu.in',
  'Kerala Agricultural University (KAU)':'https://logo.clearbit.com/kau.in',

  // ── Gujarat ───────────────────────────────────────────────────────────────
  'MS University Baroda (Faculty of Technology)': 'https://logo.clearbit.com/msubaroda.ac.in',
  'Anand Agricultural University':       'https://logo.clearbit.com/aau.in',

  // ── Rajasthan ─────────────────────────────────────────────────────────────
  'BITS Pilani':                         'https://logo.clearbit.com/bits-pilani.ac.in',
  'SMS Medical College':                 'https://logo.clearbit.com/smsjaipur.in',

  // ── Uttar Pradesh ─────────────────────────────────────────────────────────
  'HBTU Kanpur':                         'https://logo.clearbit.com/hbtu.ac.in',
  'KGMU (King George\'s Medical University)': 'https://logo.clearbit.com/kgmu.org',

  // ── West Bengal ───────────────────────────────────────────────────────────
  'Jadavpur University':                 'https://logo.clearbit.com/jadavpuruniversity.in',
  'Medical College and Hospital Kolkata':'https://logo.clearbit.com/mchkolkata.com',

  // ── Punjab / Haryana ──────────────────────────────────────────────────────
  'Thapar Institute of Engineering and Technology': 'https://logo.clearbit.com/thapar.edu',

  // ── Unmapped Edge Cases ───────────────────────────────────────────────────
  'Sacred Heart College(autonomous)Thirupattur-635 601': 'https://logo.clearbit.com/shctpt.edu',

  // ── Tamil Nadu – Popular Private Colleges ─────────────────────────────────
  'Saveetha Institute of Medical and Technical Sciences': 'https://logo.clearbit.com/saveetha.com',
  'SAVEETHA INSTITUTE OF MEDICAL AND TECHNICAL SCIENCES (DEEMED TO BE UNIVERSITY)': 'https://logo.clearbit.com/saveetha.com',
  'Saveetha Engineering College': 'https://logo.clearbit.com/saveetha.com',
  'Saveetha Medical College': 'https://logo.clearbit.com/saveetha.com',
  'Sathyabama Institute of Science and Technology': 'https://logo.clearbit.com/sathyabama.ac.in',
  'Amrita Vishwa Vidyapeetham': 'https://logo.clearbit.com/amrita.edu',
  'Amrita School of Engineering': 'https://logo.clearbit.com/amrita.edu',
  'Hindustan Institute of Technology and Science': 'https://logo.clearbit.com/hindustanuniv.ac.in',
  'Vel Tech Rangarajan Dr Sagunthala R&D Institute of Science and Technology': 'https://logo.clearbit.com/veltech.edu.in',
  'Vel Tech University': 'https://logo.clearbit.com/veltech.edu.in',
  'Rajalakshmi Engineering College': 'https://logo.clearbit.com/rajalakshmi.edu.in',
  'Sri Krishna College of Engineering and Technology': 'https://logo.clearbit.com/skcet.ac.in',
  'Karpagam Academy of Higher Education': 'https://logo.clearbit.com/karpagam.edu.in',
  'KPR Institute of Engineering and Technology': 'https://logo.clearbit.com/kpriet.ac.in',
  'Kongu Engineering College': 'https://logo.clearbit.com/kongu.ac.in',
  'Bannari Amman Institute of Technology': 'https://logo.clearbit.com/bitsathy.ac.in',
  'Kumaraguru College of Technology': 'https://logo.clearbit.com/kct.ac.in',
  'Mepco Schlenk Engineering College': 'https://logo.clearbit.com/mepcoeng.ac.in',
  'Velammal Engineering College': 'https://logo.clearbit.com/velammal.edu.in',
  'Valliammai Engineering College': 'https://logo.clearbit.com/valliammai.ac.in',
  'Panimalar Engineering College': 'https://logo.clearbit.com/panimalar.ac.in',
  'Sri Sai Ram Engineering College': 'https://logo.clearbit.com/sairam.edu.in',
  'SASTRA Deemed University': 'https://logo.clearbit.com/sastra.edu',
  'Shanmugha Arts Science Technology & Research Academy (SASTRA)': 'https://logo.clearbit.com/sastra.edu',
  'Kalasalingam Academy of Research and Education': 'https://logo.clearbit.com/kalasalingam.ac.in',
  'Sri Venkateswara College of Engineering': 'https://logo.clearbit.com/svce.ac.in',
  'Jeppiaar Engineering College': 'https://logo.clearbit.com/jeppiaarcollege.org',

  // ── Karnataka – Popular Private Colleges ──────────────────────────────────
  'Manipal Academy of Higher Education': 'https://logo.clearbit.com/manipal.edu',
  'Manipal Institute of Technology': 'https://logo.clearbit.com/manipal.edu',
  'M.S. Ramaiah Institute of Technology': 'https://logo.clearbit.com/msrit.edu',
  'Dayananda Sagar College of Engineering': 'https://logo.clearbit.com/dsce.edu.in',
  'JSS Academy of Technical Education': 'https://logo.clearbit.com/jssateb.ac.in',
  'New Horizon College of Engineering': 'https://logo.clearbit.com/newhorizonindia.edu',
  'CMR Institute of Technology': 'https://logo.clearbit.com/cmrit.ac.in',
  'Alliance University': 'https://logo.clearbit.com/alliance.edu.in',
  'Jain University': 'https://logo.clearbit.com/jainuniversity.ac.in',
  'Reva University': 'https://logo.clearbit.com/reva.edu.in',

  // ── Maharashtra ───────────────────────────────────────────────────────────
  'MIT World Peace University': 'https://logo.clearbit.com/mitwpu.edu.in',
  'Pune Institute of Computer Technology': 'https://logo.clearbit.com/pict.edu',
  'Vishwakarma Institute of Technology': 'https://logo.clearbit.com/vit.edu',
  'D.Y. Patil International University': 'https://logo.clearbit.com/dypiemr.ac.in',
  'Sinhgad College of Engineering': 'https://logo.clearbit.com/sinhgad.edu',
  'Bharati Vidyapeeth Deemed University': 'https://logo.clearbit.com/bharatividyapeeth.edu',
  'Sandip University': 'https://logo.clearbit.com/sandipuniversity.edu.in',

  // ── Delhi / NCR ───────────────────────────────────────────────────────────
  'Guru Gobind Singh Indraprastha University': 'https://logo.clearbit.com/ipu.ac.in',
  'Jamia Millia Islamia': 'https://logo.clearbit.com/jmi.ac.in',
  'Amity University': 'https://logo.clearbit.com/amity.edu',
  'Shiv Nadar University': 'https://logo.clearbit.com/snu.edu.in',

  // ── Uttar Pradesh ─────────────────────────────────────────────────────────
  'Galgotias University': 'https://logo.clearbit.com/galgotiasuniversity.edu.in',
  'Lovely Professional University': 'https://logo.clearbit.com/lpu.in',
  'Chandigarh University': 'https://logo.clearbit.com/cuchd.in',
  'Chitkara University': 'https://logo.clearbit.com/chitkara.edu.in',

  // ── Rajasthan ─────────────────────────────────────────────────────────────
  'Poornima University': 'https://logo.clearbit.com/poornima.edu.in',
  'LNM Institute of Information Technology': 'https://logo.clearbit.com/lnmiit.ac.in',

  // ── Gujarat ───────────────────────────────────────────────────────────────
  'Nirma University': 'https://logo.clearbit.com/nirmauni.ac.in',
  'Dhirubhai Ambani Institute of Information and Communication Technology': 'https://logo.clearbit.com/daiict.ac.in',
  'Charotar University of Science and Technology': 'https://logo.clearbit.com/charusat.ac.in',

  // ── Andhra Pradesh / Telangana ────────────────────────────────────────────
  'KL University': 'https://logo.clearbit.com/kluniversity.in',
  'Koneru Lakshmaiah Education Foundation': 'https://logo.clearbit.com/kluniversity.in',
  'GITAM University': 'https://logo.clearbit.com/gitam.edu',
  'Vignan Foundation for Science Technology and Research': 'https://logo.clearbit.com/vignan.ac.in',
  'Sreenidhi Institute of Science and Technology': 'https://logo.clearbit.com/sreenidhi.edu.in',

  // ── Kerala ────────────────────────────────────────────────────────────────
  'Cochin University of Science and Technology': 'https://logo.clearbit.com/cusat.ac.in',
  'APJ Abdul Kalam Technological University': 'https://logo.clearbit.com/ktu.edu.in',

  // ── West Bengal ───────────────────────────────────────────────────────────
  'Heritage Institute of Technology': 'https://logo.clearbit.com/heritageit.edu',
  'Institute of Engineering & Management': 'https://logo.clearbit.com/iemcal.com',
  'Techno India University': 'https://logo.clearbit.com/technoindiauniversity.ac.in',

  // ── Haryana ───────────────────────────────────────────────────────────────
  'Maharishi Dayanand University': 'https://logo.clearbit.com/mdu.ac.in',
  'Kurukshetra University': 'https://logo.clearbit.com/kuk.ac.in',

  // ── Bihar / Jharkhand ─────────────────────────────────────────────────────
  'BIT Mesra': 'https://logo.clearbit.com/bitmesra.ac.in',
  'Xavier Institute of Social Service': 'https://logo.clearbit.com/xiss.edu',
};

// Helper: Clean/normalize names for high-confidence matching
const normalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Returns the best logo URL for a college.
 * Priority: COLLEGE_LOGO_DIRECT → COLLEGE_LOGOS (Clearbit) → null
 */
export const getCollegeLogo = (collegeName) => {
  if (!collegeName) return null;

  // 1. Exact match check
  if (COLLEGE_LOGO_DIRECT[collegeName]) return COLLEGE_LOGO_DIRECT[collegeName];
  if (COLLEGE_LOGOS[collegeName]) return COLLEGE_LOGOS[collegeName];

  // 2. Normalized name check (handles minor formatting / spacing variations safely)
  const normName = normalizeName(collegeName);
  
  const directKey = Object.keys(COLLEGE_LOGO_DIRECT).find(k => normalizeName(k) === normName);
  if (directKey) return COLLEGE_LOGO_DIRECT[directKey];

  const clearKey = Object.keys(COLLEGE_LOGOS).find(k => normalizeName(k) === normName);
  if (clearKey) return COLLEGE_LOGOS[clearKey];

  return null;
};

/**
 * Returns a Google Favicon API URL (128 px) as a stage-3 image fallback.
 * Only works when the Clearbit entry exists (to extract the domain).
 */
export const getCollegeLogoFallback = (collegeName) => {
  if (!collegeName) return null;
  
  const key = Object.keys(COLLEGE_LOGOS).find(k => 
    k === collegeName || normalizeName(k) === normalizeName(collegeName)
  );
  if (!key) return null;
  const domain = COLLEGE_LOGOS[key].replace('https://logo.clearbit.com/', '');
  
  // Use Google's newer FaviconV2 API which is extremely reliable and auto-generates 
  // beautiful letter-marks if the site doesn't have a favicon!
  return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;
};

/**
 * Returns initials for a college name (used as offline fallback avatar).
 * e.g. "IIT Madras" → "IM", "NIT Trichy" → "NT"
 */
export const getCollegeInitials = (collegeName) => {
  if (!collegeName) return '🏛';
  const words = collegeName.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('');
};

