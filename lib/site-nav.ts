/**
 * Header / footer navigation data.
 * Every href below was verified to return HTTP 200 on the local site (14 Nov 2026) before it was added.
 * Do not add links here without checking the page exists - no placeholder or planned URLs.
 */
export type NavLink = { href: string; label: string };
export type NavExam = NavLink & { cutoff?: string };
export type NavStream = {
  key: string;
  label: string;
  colleges: NavLink[];
  col2Title: string;
  col2: NavLink[];
  exams: NavExam[];
  guides: NavLink[];
};

export const SITE_EMAIL_ADDRESS = 'mail@collegedecision.in';
export const COMPARE_HREF = '/compare-colleges-2026';
/** Homepage "Find your best-fit college" decision tool section. */
export const BEST_FIT_HREF = '/#decision-title';
export const CONTACT_HREF = '/contact';

export const NAV_STREAMS: NavStream[] = [
  {
    "key": "engineering",
    "label": "Engineering",
    "colleges": [
      {
        "href": "/engineering-colleges",
        "label": "B.Tech / B.E. colleges"
      },
      {
        "href": "/mtech-colleges",
        "label": "M.Tech colleges"
      },
      {
        "href": "/polytechnic-colleges",
        "label": "Polytechnic diploma colleges"
      },
      {
        "href": "/barch-colleges",
        "label": "B.Arch colleges"
      },
      {
        "href": "/bplan-colleges",
        "label": "B.Plan colleges"
      }
    ],
    "col2Title": "Engineering by state",
    "col2": [
      {
        "href": "/engineering-colleges-in-uttar-pradesh",
        "label": "Uttar Pradesh"
      },
      {
        "href": "/engineering-colleges-in-maharashtra",
        "label": "Maharashtra"
      },
      {
        "href": "/engineering-colleges-in-karnataka",
        "label": "Karnataka"
      },
      {
        "href": "/engineering-colleges-in-tamil-nadu",
        "label": "Tamil Nadu"
      },
      {
        "href": "/engineering-colleges-in-delhi-ncr",
        "label": "Delhi NCR"
      },
      {
        "href": "/engineering-colleges-in-telangana",
        "label": "Telangana"
      },
      {
        "href": "/engineering-colleges-in-west-bengal",
        "label": "West Bengal"
      },
      {
        "href": "/engineering-colleges-in-rajasthan",
        "label": "Rajasthan"
      },
      {
        "href": "/engineering-colleges-in-gujarat",
        "label": "Gujarat"
      },
      {
        "href": "/engineering-colleges-in-madhya-pradesh",
        "label": "Madhya Pradesh"
      }
    ],
    "exams": [
      {
        "href": "/exams/jee-main",
        "label": "JEE Main",
        "cutoff": "/exams/jee-main/cutoff"
      },
      {
        "href": "/exams/jee-advanced",
        "label": "JEE Advanced",
        "cutoff": "/exams/jee-advanced/cutoff"
      },
      {
        "href": "/exams/gate",
        "label": "GATE",
        "cutoff": "/exams/gate/cutoff"
      },
      {
        "href": "/exams/bitsat",
        "label": "BITSAT",
        "cutoff": "/exams/bitsat/cutoff"
      },
      {
        "href": "/exams/wbjee",
        "label": "WBJEE",
        "cutoff": "/exams/wbjee/cutoff"
      },
      {
        "href": "/exams/mh-cet",
        "label": "Maharashtra CET",
        "cutoff": "/exams/mh-cet/cutoff"
      },
      {
        "href": "/exams/kcet",
        "label": "KCET",
        "cutoff": "/exams/kcet/cutoff"
      },
      {
        "href": "/exams/ap-eapcet",
        "label": "AP EAPCET",
        "cutoff": "/exams/ap-eapcet/cutoff"
      },
      {
        "href": "/exams/ts-eapcet",
        "label": "TS EAPCET",
        "cutoff": "/exams/ts-eapcet/cutoff"
      },
      {
        "href": "/exams/viteee",
        "label": "VITEEE"
      }
    ],
    "guides": [
      {
        "href": "/courses/engineering",
        "label": "B.Tech / B.E. guide"
      },
      {
        "href": "/courses/mtech",
        "label": "M.Tech guide"
      },
      {
        "href": "/courses/polytechnic",
        "label": "Polytechnic guide"
      },
      {
        "href": "/courses/architecture",
        "label": "Architecture guide"
      },
      {
        "href": "/courses",
        "label": "All course guides"
      }
    ]
  },
  {
    "key": "mba",
    "label": "MBA",
    "colleges": [
      {
        "href": "/mba-colleges",
        "label": "MBA / PGDM colleges"
      },
      {
        "href": "/online-mba-colleges",
        "label": "Online MBA colleges"
      },
      {
        "href": "/management-diploma-colleges",
        "label": "Management diploma colleges"
      },
      {
        "href": "/bba-colleges",
        "label": "BBA colleges"
      },
      {
        "href": "/executive-programme-colleges",
        "label": "Executive programmes colleges"
      }
    ],
    "col2Title": "MBA by state",
    "col2": [
      {
        "href": "/mba-colleges-in-uttar-pradesh",
        "label": "Uttar Pradesh"
      },
      {
        "href": "/mba-colleges-in-maharashtra",
        "label": "Maharashtra"
      },
      {
        "href": "/mba-colleges-in-karnataka",
        "label": "Karnataka"
      },
      {
        "href": "/mba-colleges-in-tamil-nadu",
        "label": "Tamil Nadu"
      },
      {
        "href": "/mba-colleges-in-delhi-ncr",
        "label": "Delhi NCR"
      },
      {
        "href": "/mba-colleges-in-telangana",
        "label": "Telangana"
      },
      {
        "href": "/mba-colleges-in-west-bengal",
        "label": "West Bengal"
      },
      {
        "href": "/mba-colleges-in-rajasthan",
        "label": "Rajasthan"
      },
      {
        "href": "/mba-colleges-in-gujarat",
        "label": "Gujarat"
      },
      {
        "href": "/mba-colleges-in-madhya-pradesh",
        "label": "Madhya Pradesh"
      }
    ],
    "exams": [
      {
        "href": "/exams/cat",
        "label": "CAT",
        "cutoff": "/exams/cat/cutoff"
      },
      {
        "href": "/exams/xat",
        "label": "XAT"
      },
      {
        "href": "/exams/cmat",
        "label": "CMAT"
      },
      {
        "href": "/exams/mat",
        "label": "MAT"
      },
      {
        "href": "/exams/snap",
        "label": "SNAP"
      },
      {
        "href": "/exams/nmat",
        "label": "NMAT",
        "cutoff": "/exams/nmat/cutoff"
      },
      {
        "href": "/exams/mah-mba-cet",
        "label": "MAH MBA CET"
      },
      {
        "href": "/exams/gmat",
        "label": "GMAT"
      },
      {
        "href": "/exams/icet",
        "label": "ICET"
      },
      {
        "href": "/exams/tancet",
        "label": "TANCET"
      }
    ],
    "guides": [
      {
        "href": "/courses/mba",
        "label": "MBA / PGDM guide"
      },
      {
        "href": "/courses/bba",
        "label": "BBA guide"
      },
      {
        "href": "/courses",
        "label": "All course guides"
      }
    ]
  },
  {
    "key": "medical",
    "label": "Medical",
    "colleges": [
      {
        "href": "/mbbs-colleges",
        "label": "MBBS colleges"
      },
      {
        "href": "/bds-colleges",
        "label": "BDS colleges"
      },
      {
        "href": "/bams-colleges",
        "label": "BAMS colleges"
      },
      {
        "href": "/bhms-colleges",
        "label": "BHMS colleges"
      },
      {
        "href": "/nursing-colleges",
        "label": "Nursing colleges"
      },
      {
        "href": "/bpt-colleges",
        "label": "BPT colleges"
      },
      {
        "href": "/md-colleges",
        "label": "MD colleges"
      },
      {
        "href": "/mds-colleges",
        "label": "MDS colleges"
      }
    ],
    "col2Title": "More listings",
    "col2": [
      {
        "href": "/medical-ug-colleges",
        "label": "Medical UG colleges"
      },
      {
        "href": "/medical-pg-colleges",
        "label": "Medical PG colleges"
      },
      {
        "href": "/healthcare-ug-colleges",
        "label": "Healthcare UG colleges"
      },
      {
        "href": "/healthcare-pg-colleges",
        "label": "Healthcare PG colleges"
      },
      {
        "href": "/master-of-surgery-colleges",
        "label": "MS (Master of Surgery) colleges"
      },
      {
        "href": "/gnm-colleges",
        "label": "GNM nursing colleges"
      },
      {
        "href": "/anm-colleges",
        "label": "ANM nursing colleges"
      },
      {
        "href": "/bmlt-colleges",
        "label": "BMLT colleges"
      },
      {
        "href": "/mpt-colleges",
        "label": "MPT colleges"
      }
    ],
    "exams": [
      {
        "href": "/exams/neet",
        "label": "NEET",
        "cutoff": "/exams/neet/cutoff"
      },
      {
        "href": "/exams/neet-pg",
        "label": "NEET (PG)"
      },
      {
        "href": "/exams/aipgmee",
        "label": "AIPGMEE"
      }
    ],
    "guides": [
      {
        "href": "/courses/medical",
        "label": "MBBS / medical guide"
      },
      {
        "href": "/courses/dental",
        "label": "Dental (BDS) guide"
      },
      {
        "href": "/courses",
        "label": "All course guides"
      }
    ]
  },
  {
    "key": "commerce",
    "label": "Commerce",
    "colleges": [
      {
        "href": "/bcom-colleges",
        "label": "B.Com colleges"
      },
      {
        "href": "/mcom-colleges",
        "label": "M.Com colleges"
      },
      {
        "href": "/bba-colleges",
        "label": "BBA colleges"
      },
      {
        "href": "/ba-colleges",
        "label": "BA colleges"
      }
    ],
    "col2Title": "B.Com by state",
    "col2": [
      {
        "href": "/bcom-colleges-in-uttar-pradesh",
        "label": "Uttar Pradesh"
      },
      {
        "href": "/bcom-colleges-in-maharashtra",
        "label": "Maharashtra"
      },
      {
        "href": "/bcom-colleges-in-karnataka",
        "label": "Karnataka"
      },
      {
        "href": "/bcom-colleges-in-tamil-nadu",
        "label": "Tamil Nadu"
      },
      {
        "href": "/bcom-colleges-in-delhi-ncr",
        "label": "Delhi NCR"
      },
      {
        "href": "/bcom-colleges-in-telangana",
        "label": "Telangana"
      },
      {
        "href": "/bcom-colleges-in-west-bengal",
        "label": "West Bengal"
      },
      {
        "href": "/bcom-colleges-in-rajasthan",
        "label": "Rajasthan"
      },
      {
        "href": "/bcom-colleges-in-gujarat",
        "label": "Gujarat"
      },
      {
        "href": "/bcom-colleges-in-madhya-pradesh",
        "label": "Madhya Pradesh"
      }
    ],
    "exams": [
      {
        "href": "/exams/cuet-ug",
        "label": "CUET UG",
        "cutoff": "/exams/cuet-ug/cutoff"
      },
      {
        "href": "/exams/cuet-pg",
        "label": "CUET PG"
      },
      {
        "href": "/exams/ipmat",
        "label": "IPMAT",
        "cutoff": "/exams/ipmat/cutoff"
      },
      {
        "href": "/exams/jipmat",
        "label": "JIPMAT"
      }
    ],
    "guides": [
      {
        "href": "/courses/commerce",
        "label": "B.Com guide"
      },
      {
        "href": "/courses/mcom",
        "label": "M.Com guide"
      },
      {
        "href": "/courses/arts",
        "label": "BA guide"
      },
      {
        "href": "/courses",
        "label": "All course guides"
      }
    ]
  },
  {
    "key": "law",
    "label": "Law",
    "colleges": [
      {
        "href": "/llb-colleges",
        "label": "LLB colleges"
      },
      {
        "href": "/ba-llb-colleges",
        "label": "BA LLB (integrated) colleges"
      },
      {
        "href": "/llm-colleges",
        "label": "LLM colleges"
      }
    ],
    "col2Title": "Compare law colleges",
    "col2": [
      {
        "href": "/articles/ils-law-vs-symbiosis-law-law-decision-guide",
        "label": "ILS Law College vs Symbiosis Law School, Pune for LLB"
      },
      {
        "href": "/articles/adarsha-law-college-warangal-vs-kv-ranga-reddy-law-college-hyderabad-law-decision-guide",
        "label": "Adarsha Law College - Warangal vs KV Ranga Reddy Law College for LLB"
      },
      {
        "href": "/articles/mahatma-gandhi-law-college-hyderabad-vs-sultan-ul-uloom-law-college-hyderabad-law-decision-guide",
        "label": "Mahatma Gandhi Law College vs Sultan Ul for LLB"
      }
    ],
    "exams": [
      {
        "href": "/exams/clat",
        "label": "CLAT",
        "cutoff": "/exams/clat/cutoff"
      },
      {
        "href": "/exams/ailet",
        "label": "AILET",
        "cutoff": "/exams/ailet/cutoff"
      },
      {
        "href": "/exams/lsat",
        "label": "LSAT"
      },
      {
        "href": "/exams/mh-cet-law",
        "label": "MH CET Law"
      },
      {
        "href": "/exams/lawcet",
        "label": "LAWCET"
      },
      {
        "href": "/exams/ts-lawcet",
        "label": "TS LAWCET"
      }
    ],
    "guides": [
      {
        "href": "/courses/law",
        "label": "LLB guide"
      },
      {
        "href": "/courses/integrated-law",
        "label": "Integrated law guide"
      },
      {
        "href": "/courses",
        "label": "All course guides"
      }
    ]
  },
  {
    "key": "design",
    "label": "Design",
    "colleges": [
      {
        "href": "/bdes-colleges",
        "label": "B.Des colleges"
      },
      {
        "href": "/mdes-colleges",
        "label": "M.Des colleges"
      },
      {
        "href": "/fashion-design-ug-colleges",
        "label": "Fashion design (UG) colleges"
      },
      {
        "href": "/fashion-design-pg-colleges",
        "label": "Fashion design (PG) colleges"
      },
      {
        "href": "/design-diploma-colleges",
        "label": "Design diploma colleges"
      },
      {
        "href": "/bfa-colleges",
        "label": "BFA colleges"
      },
      {
        "href": "/animation-ug-colleges",
        "label": "Animation (UG) colleges"
      }
    ],
    "col2Title": "More listings",
    "col2": [
      {
        "href": "/fine-arts-diploma-colleges",
        "label": "Fine arts diploma colleges"
      },
      {
        "href": "/mfa-colleges",
        "label": "MFA colleges"
      },
      {
        "href": "/animation-diploma-colleges",
        "label": "Animation diploma colleges"
      },
      {
        "href": "/diploma-in-fashion-colleges",
        "label": "Fashion diploma colleges"
      },
      {
        "href": "/bpa-colleges",
        "label": "BPA (performing arts) colleges"
      }
    ],
    "exams": [
      {
        "href": "/exams/nid-entrance-exam",
        "label": "NID DAT"
      },
      {
        "href": "/exams/nift",
        "label": "NIFT"
      },
      {
        "href": "/exams/uceed",
        "label": "UCEED"
      },
      {
        "href": "/exams/nata",
        "label": "NATA"
      }
    ],
    "guides": [
      {
        "href": "/courses/architecture",
        "label": "Architecture guide"
      },
      {
        "href": "/courses",
        "label": "All course guides"
      }
    ]
  },
  {
    "key": "pharmacy",
    "label": "Pharmacy",
    "colleges": [
      {
        "href": "/bpharm-colleges",
        "label": "B.Pharm colleges"
      },
      {
        "href": "/mpharm-colleges",
        "label": "M.Pharm colleges"
      },
      {
        "href": "/dpharma-colleges",
        "label": "D.Pharm colleges"
      }
    ],
    "col2Title": "Compare pharmacy colleges",
    "col2": [
      {
        "href": "/articles/noida-niet-vs-sharda-su-bpharm-decision-guide",
        "label": "NIET Greater Noida vs Sharda University for B.Pharm"
      },
      {
        "href": "/articles/g-pulla-reddy-college-of-pharmacy-hyderabad-vs-mlr-institute-of-pharmacy-bpharm-decision-guide",
        "label": "G Pulla vs MLR institute of Pharmacy for B.Pharm"
      },
      {
        "href": "/articles/pulla-reddy-institute-of-pharmacy-vs-st-peters-institute-of-pharmaceutical-sciences-spips-warangal-bpharm-decision-guide",
        "label": "Pulla Reddy vs SPIPS Hanamkonda for B.Pharm"
      }
    ],
    "exams": [
      {
        "href": "/exams/gpat",
        "label": "GPAT"
      }
    ],
    "guides": [
      {
        "href": "/courses/bpharm",
        "label": "B.Pharm guide"
      },
      {
        "href": "/courses",
        "label": "All course guides"
      }
    ]
  },
  {
    "key": "more",
    "label": "More",
    "colleges": [
      {
        "href": "/bca-colleges",
        "label": "BCA colleges"
      },
      {
        "href": "/mca-colleges",
        "label": "MCA colleges"
      },
      {
        "href": "/bsc-colleges",
        "label": "B.Sc colleges"
      },
      {
        "href": "/msc-colleges",
        "label": "M.Sc colleges"
      },
      {
        "href": "/ba-colleges",
        "label": "BA colleges"
      },
      {
        "href": "/ma-colleges",
        "label": "MA colleges"
      },
      {
        "href": "/bed-colleges",
        "label": "B.Ed colleges"
      },
      {
        "href": "/bhm-colleges",
        "label": "Hotel management (BHM) colleges"
      },
      {
        "href": "/mass-communication-colleges",
        "label": "Mass communication colleges"
      },
      {
        "href": "/phd-colleges",
        "label": "PhD colleges"
      }
    ],
    "col2Title": "B.Sc & BA by state",
    "col2": [
      {
        "href": "/bsc-colleges-in-uttar-pradesh",
        "label": "B.Sc in Uttar Pradesh"
      },
      {
        "href": "/bsc-colleges-in-maharashtra",
        "label": "B.Sc in Maharashtra"
      },
      {
        "href": "/bsc-colleges-in-karnataka",
        "label": "B.Sc in Karnataka"
      },
      {
        "href": "/bsc-colleges-in-tamil-nadu",
        "label": "B.Sc in Tamil Nadu"
      },
      {
        "href": "/bsc-colleges-in-delhi-ncr",
        "label": "B.Sc in Delhi NCR"
      },
      {
        "href": "/ba-colleges-in-uttar-pradesh",
        "label": "BA in Uttar Pradesh"
      },
      {
        "href": "/ba-colleges-in-maharashtra",
        "label": "BA in Maharashtra"
      },
      {
        "href": "/ba-colleges-in-karnataka",
        "label": "BA in Karnataka"
      },
      {
        "href": "/ba-colleges-in-tamil-nadu",
        "label": "BA in Tamil Nadu"
      },
      {
        "href": "/ba-colleges-in-delhi-ncr",
        "label": "BA in Delhi NCR"
      }
    ],
    "exams": [
      {
        "href": "/exams/cuet-ug",
        "label": "CUET UG",
        "cutoff": "/exams/cuet-ug/cutoff"
      },
      {
        "href": "/exams/cuet-pg",
        "label": "CUET PG"
      },
      {
        "href": "/exams/nimcet",
        "label": "NIMCET"
      },
      {
        "href": "/exams/iit-jam",
        "label": "IIT JAM"
      },
      {
        "href": "/exams/nchmct-jee",
        "label": "NCHMCT JEE"
      },
      {
        "href": "/exams/up-jee-bed",
        "label": "UP JEE B.Ed"
      }
    ],
    "guides": [
      {
        "href": "/courses/bca",
        "label": "BCA guide"
      },
      {
        "href": "/courses/mca",
        "label": "MCA guide"
      },
      {
        "href": "/courses/bsc",
        "label": "B.Sc guide"
      },
      {
        "href": "/courses/ma",
        "label": "MA guide"
      },
      {
        "href": "/courses/b-ed",
        "label": "B.Ed guide"
      },
      {
        "href": "/courses/bhm",
        "label": "Hotel management guide"
      },
      {
        "href": "/courses",
        "label": "All course guides"
      }
    ]
  }
];

export const COMPARE_ARTICLES: { stream: string; links: NavLink[] }[] = [
  {
    "stream": "Engineering",
    "links": [
      {
        "href": "/articles/sacs-mavmm-vs-thiagarajar-madurai-engineering-decision-guide",
        "label": "SACS MAVMM vs Thiagarajar College of Engineering for B.Tech"
      },
      {
        "href": "/articles/harcourt-butler-vs-pranveer-singh-engineering-decision-guide",
        "label": "HBTU Kanpur vs PSIT Kanpur for B.Tech"
      }
    ]
  },
  {
    "stream": "MBA",
    "links": [
      {
        "href": "/articles/amritsar-acet-vs-indian-amritsar-mba-decision-guide",
        "label": "ACET Amritsar vs IIM Amritsar Punjab for MBA / PGDM"
      },
      {
        "href": "/articles/karnavati-gandhinagar-vs-pandit-deendayal-mba-decision-guide",
        "label": "Karnavati University vs PDEU for MBA / PGDM"
      }
    ]
  },
  {
    "stream": "Commerce",
    "links": [
      {
        "href": "/articles/chanderprabhu-jain-vs-shri-ram-commerce-decision-guide",
        "label": "CPJ College vs Shri Ram College of Commerce for BCom"
      },
      {
        "href": "/articles/mithibai-arts-vs-sk-somaiya-commerce-decision-guide",
        "label": "Mithibai College vs SK Somaiya College for BCom"
      }
    ]
  },
  {
    "stream": "Law",
    "links": [
      {
        "href": "/articles/ils-law-vs-symbiosis-law-law-decision-guide",
        "label": "ILS Law College vs Symbiosis Law School, Pune for LLB"
      },
      {
        "href": "/articles/adarsha-law-college-warangal-vs-kv-ranga-reddy-law-college-hyderabad-law-decision-guide",
        "label": "Adarsha Law College - Warangal vs KV Ranga Reddy Law College for LLB"
      }
    ]
  },
  {
    "stream": "Pharmacy",
    "links": [
      {
        "href": "/articles/noida-niet-vs-sharda-su-bpharm-decision-guide",
        "label": "NIET Greater Noida vs Sharda University for B.Pharm"
      },
      {
        "href": "/articles/g-pulla-reddy-college-of-pharmacy-hyderabad-vs-mlr-institute-of-pharmacy-bpharm-decision-guide",
        "label": "G Pulla vs MLR institute of Pharmacy for B.Pharm"
      }
    ]
  },
  {
    "stream": "BCA",
    "links": [
      {
        "href": "/articles/jain-bangalore-vs-kristu-jayanti-bca-decision-guide",
        "label": "Jain University vs Kristu Jayanti University for BCA"
      },
      {
        "href": "/articles/amity-noida-vs-studies-ims-bca-decision-guide",
        "label": "Amity University Noida vs IMS Noida for BCA"
      }
    ]
  }
];

export const POPULAR_LINKS: NavLink[] = [
  { href: '/engineering-colleges', label: 'B.Tech' },
  { href: '/mba-colleges', label: 'MBA' },
  { href: '/bcom-colleges', label: 'BCom' },
  { href: '/mbbs-colleges', label: 'MBBS' },
  { href: '/bba-colleges', label: 'BBA' },
  { href: '/bca-colleges', label: 'BCA' },
  { href: '/exams/jee-main', label: 'JEE Main' },
  { href: '/exams/cat', label: 'CAT' },
  { href: '/exams/gate', label: 'GATE' }
];

export const PRIMARY_LINKS: NavLink[] = [
  { href: '/colleges', label: 'Colleges' },
  { href: '/exams', label: 'Exams' },
  { href: '/courses', label: 'Courses' },
  { href: '/articles', label: 'Articles' }
];

export const FOOTER_STREAMS: NavLink[] = [
  { href: '/engineering-colleges', label: 'Engineering colleges' },
  { href: '/mba-colleges', label: 'MBA / PGDM colleges' },
  { href: '/mbbs-colleges', label: 'MBBS colleges' },
  { href: '/bcom-colleges', label: 'B.Com colleges' },
  { href: '/llb-colleges', label: 'LLB colleges' },
  { href: '/bdes-colleges', label: 'B.Des colleges' },
  { href: '/bpharm-colleges', label: 'B.Pharm colleges' },
  { href: '/bca-colleges', label: 'BCA colleges' },
  { href: '/colleges', label: 'All colleges' }
];

export const FOOTER_STATES: NavLink[] = [
  { href: '/engineering-colleges-in-uttar-pradesh', label: 'Engineering colleges in Uttar Pradesh' },
  { href: '/engineering-colleges-in-maharashtra', label: 'Engineering colleges in Maharashtra' },
  { href: '/engineering-colleges-in-karnataka', label: 'Engineering colleges in Karnataka' },
  { href: '/engineering-colleges-in-tamil-nadu', label: 'Engineering colleges in Tamil Nadu' },
  { href: '/mba-colleges-in-delhi-ncr', label: 'MBA colleges in Delhi NCR' },
  { href: '/mba-colleges-in-maharashtra', label: 'MBA colleges in Maharashtra' },
  { href: '/mba-colleges-in-uttar-pradesh', label: 'MBA colleges in Uttar Pradesh' },
  { href: '/bcom-colleges-in-delhi-ncr', label: 'B.Com colleges in Delhi NCR' },
  { href: '/bcom-colleges-in-maharashtra', label: 'B.Com colleges in Maharashtra' }
];

export const FOOTER_EXAMS: NavLink[] = [
  { href: '/exams/jee-main', label: 'JEE Main' },
  { href: '/exams/neet', label: 'NEET' },
  { href: '/exams/cat', label: 'CAT' },
  { href: '/exams/gate', label: 'GATE' },
  { href: '/exams/jee-advanced', label: 'JEE Advanced' },
  { href: '/exams/cuet-ug', label: 'CUET UG' },
  { href: '/exams/clat', label: 'CLAT' },
  { href: '/exams/bitsat', label: 'BITSAT' },
  { href: '/exams/xat', label: 'XAT' },
  { href: '/exams/nift', label: 'NIFT' }
];

export const FOOTER_COURSES: NavLink[] = [
  { href: '/courses/engineering', label: 'B.Tech / B.E.' },
  { href: '/courses/mba', label: 'MBA / PGDM' },
  { href: '/courses/medical', label: 'MBBS / medical' },
  { href: '/courses/commerce', label: 'B.Com' },
  { href: '/courses/law', label: 'LLB' },
  { href: '/courses/bba', label: 'BBA' },
  { href: '/courses/bca', label: 'BCA' },
  { href: '/courses/bpharm', label: 'B.Pharm' },
  { href: '/courses', label: 'All course guides' }
];

export const FOOTER_COMPANY: NavLink[] = [
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
  { href: '/articles', label: 'Guides & articles' },
  { href: COMPARE_HREF, label: 'Compare colleges' },
  { href: '/privacy-policy', label: 'Privacy policy' },
  { href: '/terms-and-conditions', label: 'Terms & conditions' },
  { href: '/disclaimer', label: 'Disclaimer' }
];
