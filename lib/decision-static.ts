export type DecisionCourse = { name: string; slug: string };
export type DecisionState = { name: string; slug: string };
export type DecisionCity = { name: string; stateSlug: string };

// Generated from active courses, institutes, and programmes in production.
// Refresh when the underlying catalogue changes.
export const decisionCourses: readonly DecisionCourse[] = [
  {
    "name": "Advance Certificate",
    "slug": "advance-certificate"
  },
  {
    "name": "Advance Diploma",
    "slug": "advance-diploma"
  },
  {
    "name": "Animation - Diploma",
    "slug": "animation-diploma"
  },
  {
    "name": "Animation - PG",
    "slug": "animation-pg"
  },
  {
    "name": "Animation - UG",
    "slug": "animation-ug"
  },
  {
    "name": "Architecture - Diploma",
    "slug": "architecture-diploma"
  },
  {
    "name": "Aviation",
    "slug": "aviation"
  },
  {
    "name": "Aviation - Diploma",
    "slug": "diploma-aviation"
  },
  {
    "name": "Aviation - PG",
    "slug": "aviation-pg"
  },
  {
    "name": "B. Chem. Eng.",
    "slug": "B. Chem. Eng."
  },
  {
    "name": "B. P. Ed.",
    "slug": "bped"
  },
  {
    "name": "B.A.M.S",
    "slug": "bams"
  },
  {
    "name": "B.Arch",
    "slug": "architecture"
  },
  {
    "name": "B.F.Tech",
    "slug": "bftech"
  },
  {
    "name": "B.H.M.S",
    "slug": "bhms"
  },
  {
    "name": "B.Lit",
    "slug": "blit"
  },
  {
    "name": "B.M.L.T",
    "slug": "bmlt"
  },
  {
    "name": "B.P.A",
    "slug": "bpa"
  },
  {
    "name": "B.Pharm",
    "slug": "bpharm"
  },
  {
    "name": "B.Tech / B.E.",
    "slug": "engineering"
  },
  {
    "name": "B.V.A",
    "slug": "bva"
  },
  {
    "name": "B.Voc",
    "slug": "bvoc"
  },
  {
    "name": "BA",
    "slug": "arts"
  },
  {
    "name": "Bachelor Of Design",
    "slug": "design-ug"
  },
  {
    "name": "Bachelor of Fine Arts (B.F.A)",
    "slug": "bfa"
  },
  {
    "name": "Bachelor of Library Science( B.Lib)",
    "slug": "b-lib"
  },
  {
    "name": "Bachelor of Physiotherapy (BPT)",
    "slug": "physiotherapy"
  },
  {
    "name": "Bachelor of Social Work",
    "slug": "bsw"
  },
  {
    "name": "Bachelor's Degree in Hotel, Hospitality and Tourism Management",
    "slug": "bachelor-hotel-hospitality-tourism"
  },
  {
    "name": "Bachelors",
    "slug": "bachelors"
  },
  {
    "name": "bachelors in mass communication",
    "slug": "masscomm"
  },
  {
    "name": "Bachelors Of Technology",
    "slug": "btech"
  },
  {
    "name": "BBA / BBM / BBS",
    "slug": "bba"
  },
  {
    "name": "BCA",
    "slug": "bca"
  },
  {
    "name": "BCom",
    "slug": "commerce"
  },
  {
    "name": "BDS",
    "slug": "dental"
  },
  {
    "name": "Beauty-Healthcare",
    "slug": "beauty"
  },
  {
    "name": "BEd",
    "slug": "b-ed"
  },
  {
    "name": "BHM",
    "slug": "bhm"
  },
  {
    "name": "BMS",
    "slug": "bms"
  },
  {
    "name": "BSc",
    "slug": "bsc"
  },
  {
    "name": "BUMS",
    "slug": "BUMS"
  },
  {
    "name": "Certificate in Auxiliary Nurse Midwife (A.N.M)",
    "slug": "anm"
  },
  {
    "name": "Certificate in Fashion Design",
    "slug": "cfd"
  },
  {
    "name": "Certificate Programmes",
    "slug": "certificate-program"
  },
  {
    "name": "D.Pharma",
    "slug": "Pharma"
  },
  {
    "name": "D.Voc",
    "slug": "dvoc"
  },
  {
    "name": "Design - Diploma",
    "slug": "diploma-design"
  },
  {
    "name": "Digital Marketing",
    "slug": "DM"
  },
  {
    "name": "Diploma",
    "slug": "diploma"
  },
  {
    "name": "Diploma - PG",
    "slug": "pg-diploma"
  },
  {
    "name": "Diploma - Science",
    "slug": "diploma-science"
  },
  {
    "name": "Diploma - UG",
    "slug": "ug-diploma"
  },
  {
    "name": "Diploma in Business Process Outsourcing (BPO)",
    "slug": "dbpo"
  },
  {
    "name": "Diploma in Dental",
    "slug": "diploma-dental"
  },
  {
    "name": "Diploma in Fashion",
    "slug": "diploma-fashion"
  },
  {
    "name": "Diploma in General Nursing and Midwifery (GNM)",
    "slug": "dgnm"
  },
  {
    "name": "Diploma in Hotel Management, Catering & Tourism",
    "slug": "dhmct"
  },
  {
    "name": "Diploma in Library Science",
    "slug": "D.LIB"
  },
  {
    "name": "Executive Programme",
    "slug": "executive-programme"
  },
  {
    "name": "Fashion Design - PG",
    "slug": "fashion-design-pg"
  },
  {
    "name": "Fashion Design - UG",
    "slug": "fashion-design-ug"
  },
  {
    "name": "Fellowship",
    "slug": "fellowship"
  },
  {
    "name": "Fine Arts - Diploma",
    "slug": "diploma-fine-arts"
  },
  {
    "name": "Foundation Course",
    "slug": "foundation-course"
  },
  {
    "name": "Healthcare - PG",
    "slug": "healthcarePG"
  },
  {
    "name": "Healthcare - UG",
    "slug": "healthcare"
  },
  {
    "name": "Hotel Management - Diploma",
    "slug": "hotel-management-diploma"
  },
  {
    "name": "Hotel Management - PG",
    "slug": "hotel-management-pg"
  },
  {
    "name": "Integrated Law",
    "slug": "integrated-law"
  },
  {
    "name": "LLB",
    "slug": "law"
  },
  {
    "name": "LLM",
    "slug": "llm"
  },
  {
    "name": "M. Chem. Eng.",
    "slug": "M. Chem. Eng."
  },
  {
    "name": "M.Arch",
    "slug": "march"
  },
  {
    "name": "M.F.A",
    "slug": "Finance and Accounting"
  },
  {
    "name": "M.F.Sc",
    "slug": "mfsc"
  },
  {
    "name": "M.P.A",
    "slug": "mpa"
  },
  {
    "name": "M.Pharm",
    "slug": "mpharm"
  },
  {
    "name": "M.Phil",
    "slug": "m-phil"
  },
  {
    "name": "M.Plan",
    "slug": "mplan"
  },
  {
    "name": "M.S",
    "slug": "m-s"
  },
  {
    "name": "M.Tech / M.E.",
    "slug": "mtech"
  },
  {
    "name": "M.Voc",
    "slug": "mvoc"
  },
  {
    "name": "MA",
    "slug": "ma"
  },
  {
    "name": "Management - Diploma",
    "slug": "mgt_diploma"
  },
  {
    "name": "Mass-Communication",
    "slug": "mass-communication"
  },
  {
    "name": "Mass-Communication-PG",
    "slug": "mass-communication-pg"
  },
  {
    "name": "Master Of Design",
    "slug": "design-pg"
  },
  {
    "name": "Master of Fine Arts (MFA)",
    "slug": "mfa"
  },
  {
    "name": "Master Of Library Science",
    "slug": "m-lib"
  },
  {
    "name": "Master of Physiotherapy(MPT)",
    "slug": "MPT-MPT"
  },
  {
    "name": "Master of Science",
    "slug": "m.s."
  },
  {
    "name": "Master Of Social Work",
    "slug": "msw"
  },
  {
    "name": "Master of Surgery",
    "slug": "MS"
  },
  {
    "name": "Masters",
    "slug": "masters"
  },
  {
    "name": "MBA / PGDM",
    "slug": "mba"
  },
  {
    "name": "MBBS",
    "slug": "medical"
  },
  {
    "name": "MCA / MCM",
    "slug": "mca"
  },
  {
    "name": "MCom",
    "slug": "mcom"
  },
  {
    "name": "MD",
    "slug": "md"
  },
  {
    "name": "MDS",
    "slug": "mds"
  },
  {
    "name": "mechatronics",
    "slug": "mechatronics"
  },
  {
    "name": "MEd",
    "slug": "m-ed"
  },
  {
    "name": "Media - Diploma",
    "slug": "diploma-media"
  },
  {
    "name": "Media - UG",
    "slug": "media-ug"
  },
  {
    "name": "Media PG",
    "slug": "media-pg"
  },
  {
    "name": "Medical - PG",
    "slug": "medical-pg"
  },
  {
    "name": "Medical - UG",
    "slug": "medical-ug"
  },
  {
    "name": "MPT",
    "slug": "mpt"
  },
  {
    "name": "MSc",
    "slug": "msc"
  },
  {
    "name": "Nursing",
    "slug": "nursing"
  },
  {
    "name": "Online BA",
    "slug": "online-ba"
  },
  {
    "name": "Online BBA",
    "slug": "online-bba"
  },
  {
    "name": "Online BCA",
    "slug": "online-bca"
  },
  {
    "name": "Online BCom",
    "slug": "online-bcom"
  },
  {
    "name": "Online BSc",
    "slug": "online-bsc"
  },
  {
    "name": "Online Certificate",
    "slug": "online-certificate"
  },
  {
    "name": "Online EMBA",
    "slug": "online-emba"
  },
  {
    "name": "Online Learning Programmes",
    "slug": "online-programmes"
  },
  {
    "name": "Online MA",
    "slug": "online-ma"
  },
  {
    "name": "Online MA JMC",
    "slug": "online-ma-jmc"
  },
  {
    "name": "Online MBA",
    "slug": "online-mba"
  },
  {
    "name": "Online MCA",
    "slug": "online-mca"
  },
  {
    "name": "Online MCom",
    "slug": "online-mcom"
  },
  {
    "name": "Online MSc",
    "slug": "online-msc"
  },
  {
    "name": "P.hd",
    "slug": "phd"
  },
  {
    "name": "PGP",
    "slug": "pgp"
  },
  {
    "name": "Pharmacy",
    "slug": "Pharm"
  },
  {
    "name": "Polytechnic Course",
    "slug": "polytechnic"
  },
  {
    "name": "Polytechnic Diploma",
    "slug": "polytechnic-diploma"
  },
  {
    "name": "Post Graduate Diploma in Computer Applications",
    "slug": "PGDCA"
  },
  {
    "name": "Travel and Tourism",
    "slug": "travel-tourism-ug"
  },
  {
    "name": "Travel and Tourism - Diploma",
    "slug": "diploma-travel"
  },
  {
    "name": "Travel and Tourism - PG",
    "slug": "travel-tourism-pg"
  },
  {
    "name": "Vocational - Diploma",
    "slug": "Voc-diploma"
  }
] as const;
export const decisionStates: readonly DecisionState[] = [
  {
    "name": "Andaman Nicobar",
    "slug": "Andaman and Nicobar"
  },
  {
    "name": "Andhra Pradesh",
    "slug": "Andhra Pradesh"
  },
  {
    "name": "Arunachal Pradesh",
    "slug": ""
  },
  {
    "name": "Assam",
    "slug": "Assam"
  },
  {
    "name": "Bihar",
    "slug": "Bihar"
  },
  {
    "name": "Chattisgarh",
    "slug": "Chattisgarh"
  },
  {
    "name": "Dadra Nagar Haveli",
    "slug": ""
  },
  {
    "name": "Daman and Diu",
    "slug": "Dadra and Nagar Haveli and Daman and Diu"
  },
  {
    "name": "Delhi NCR",
    "slug": "National Capital Territory of Delhi"
  },
  {
    "name": "Goa",
    "slug": "Goa"
  },
  {
    "name": "Gujarat",
    "slug": "Gujarat"
  },
  {
    "name": "Haryana",
    "slug": "Haryana"
  },
  {
    "name": "Himachal Pradesh",
    "slug": "Himachal Pradesh"
  },
  {
    "name": "Jammu & Kashmir",
    "slug": ""
  },
  {
    "name": "Jharkhand",
    "slug": "Jharkhand"
  },
  {
    "name": "Karnataka",
    "slug": "Karnataka"
  },
  {
    "name": "Kerala",
    "slug": "Kerala"
  },
  {
    "name": "Madhya Pradesh",
    "slug": "Madhya Pradesh"
  },
  {
    "name": "Maharashtra",
    "slug": "Maharashtra"
  },
  {
    "name": "Manipur",
    "slug": "Manipur"
  },
  {
    "name": "Meghalaya",
    "slug": "Meghalaya"
  },
  {
    "name": "Mizoram",
    "slug": "Mizoram"
  },
  {
    "name": "Nagaland",
    "slug": "Nagaland"
  },
  {
    "name": "Odisha",
    "slug": "Odisha"
  },
  {
    "name": "Puducherry",
    "slug": "Union Territory of Puducherry"
  },
  {
    "name": "Punjab",
    "slug": "Punjab"
  },
  {
    "name": "Rajasthan",
    "slug": "Rajasthan"
  },
  {
    "name": "Sikkim",
    "slug": "Sikkim"
  },
  {
    "name": "Tamil Nadu",
    "slug": "Tamil Nadu"
  },
  {
    "name": "Telangana",
    "slug": "Telangana"
  },
  {
    "name": "Tripura",
    "slug": "Tripura"
  },
  {
    "name": "Uttar Pradesh",
    "slug": "Uttar Pradesh"
  },
  {
    "name": "Uttarakhand",
    "slug": "Uttarakhand"
  },
  {
    "name": "West Bengal",
    "slug": "West Bengal"
  }
] as const;
export const decisionCities: readonly DecisionCity[] = [
  {
    "name": "Adilabad",
    "stateSlug": "Telangana"
  },
  {
    "name": "Adilabad",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Agartala",
    "stateSlug": "Tripura"
  },
  {
    "name": "Agra",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Ahmedabad",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Ahmedabad city",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Ahmednagar",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Aizawl",
    "stateSlug": "Mizoram"
  },
  {
    "name": "Ajmer",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Akola",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Alappuzha",
    "stateSlug": "Kerala"
  },
  {
    "name": "Aligarh",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Alirajpur",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Allahabad",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Almora",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Alwar",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Amaravati",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Ambala",
    "stateSlug": "Haryana"
  },
  {
    "name": "Ambedkar nagar",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Ambikapur",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Amethi",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Amravati",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Amravati",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Amreli",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Amritsar",
    "stateSlug": "Punjab"
  },
  {
    "name": "Amroha",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Anand",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Anand",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Ananthapur",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Angul",
    "stateSlug": "Odisha"
  },
  {
    "name": "Anuppur",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Araria",
    "stateSlug": "Bihar"
  },
  {
    "name": "Aravalli",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Ariyalur",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Asansol",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Aurangabad",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Aurangabad",
    "stateSlug": "Bihar"
  },
  {
    "name": "Azamgarh",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Badnera",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Bagalkot",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Bageshwar",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Bagpat",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Bahadurgarh",
    "stateSlug": "Haryana"
  },
  {
    "name": "Bailhongal",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Baksa",
    "stateSlug": "Assam"
  },
  {
    "name": "Balaghat",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Balaghat",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Balangir",
    "stateSlug": "Odisha"
  },
  {
    "name": "Baleswar",
    "stateSlug": "Odisha"
  },
  {
    "name": "Ballia",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Balod",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Balrampur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Balrampur",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Banaskantha",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Banda",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Banda",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Bankura",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Banswara",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Bapatla",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Barabanki",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Baramati",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Baramulla",
    "stateSlug": ""
  },
  {
    "name": "Bardhaman",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Bareilly",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Bargarh",
    "stateSlug": "Odisha"
  },
  {
    "name": "Barnala",
    "stateSlug": "Punjab"
  },
  {
    "name": "Baroda",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Barpeta",
    "stateSlug": "Assam"
  },
  {
    "name": "Baruipur",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Barwani",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Basti",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Bathinda",
    "stateSlug": "Punjab"
  },
  {
    "name": "Beed",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Begusarai",
    "stateSlug": "Bihar"
  },
  {
    "name": "Belagavi",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Belgaum",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Bellary",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Bemetara",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Bengaluru",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Berhampur",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Berhampur",
    "stateSlug": "Odisha"
  },
  {
    "name": "Bhadrak",
    "stateSlug": "Odisha"
  },
  {
    "name": "Bhagalpur",
    "stateSlug": "Bihar"
  },
  {
    "name": "Bhandara",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Bharatpur",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Bharuch",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Bhatinda",
    "stateSlug": "Punjab"
  },
  {
    "name": "Bhavnagar",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Bhilai",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Bhilwara",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Bhind",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Bhiwani",
    "stateSlug": "Haryana"
  },
  {
    "name": "Bhojpur",
    "stateSlug": "Bihar"
  },
  {
    "name": "Bhongir",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Bhopal",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Bhubaneswar",
    "stateSlug": "Odisha"
  },
  {
    "name": "Bidar",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Bijapur",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Bijapur(kar)",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Bijnor",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Bikaner",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Bilaspur",
    "stateSlug": "Himachal Pradesh"
  },
  {
    "name": "Bilaspur",
    "stateSlug": "Haryana"
  },
  {
    "name": "Bilaspur",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Birbhum",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Bishnupur",
    "stateSlug": "Manipur"
  },
  {
    "name": "Bokaro",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Bongaigaon",
    "stateSlug": "Assam"
  },
  {
    "name": "Bulandshahr",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Buldhana",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Bundi",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Burdwan",
    "stateSlug": "Odisha"
  },
  {
    "name": "Burdwan",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Burhanpur",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Buxar",
    "stateSlug": "Bihar"
  },
  {
    "name": "Calicut",
    "stateSlug": "Kerala"
  },
  {
    "name": "Central delhi",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "Chamoli",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Chamrajnagar",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Chandauli",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Chandigarh",
    "stateSlug": "Punjab"
  },
  {
    "name": "Chandigarh",
    "stateSlug": "Haryana"
  },
  {
    "name": "Chandrapur",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Changlang",
    "stateSlug": ""
  },
  {
    "name": "Chengalpattu",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Chennai",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Chhatarpur",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Chhindwara",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Chickmagalur",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Chikkaballapur",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Chikmagalur",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Chirala",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Chitradurga",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Chitrakoot",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Chitrakoot",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Chittoor",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Chittorgarh",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Churachandpur",
    "stateSlug": "Manipur"
  },
  {
    "name": "Churu",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Cochin",
    "stateSlug": "Kerala"
  },
  {
    "name": "Coimbatore",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Cooch behar",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Coorg",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Cuddalore",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Cuttack",
    "stateSlug": "Odisha"
  },
  {
    "name": "Dadra nagar haveli",
    "stateSlug": "Dadra and Nagar Haveli and Daman and Diu"
  },
  {
    "name": "Dahod",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Dakshina kannada",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Daman",
    "stateSlug": ""
  },
  {
    "name": "Damoh",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Darbhanga",
    "stateSlug": "Bihar"
  },
  {
    "name": "Darjeeling",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Datia",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Dausa",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Davangere",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Dehradun",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Delhi",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "Deoghar",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Deoria",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Dewas",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Dhanbad",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Dhar",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Dharmapuri",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Dharmapuri",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Dharwad",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Dhenkanal",
    "stateSlug": "Odisha"
  },
  {
    "name": "Dholpur",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Dhubri",
    "stateSlug": "Assam"
  },
  {
    "name": "Dhule",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Dibrugarh",
    "stateSlug": "Assam"
  },
  {
    "name": "Dimapur",
    "stateSlug": "Nagaland"
  },
  {
    "name": "Dindigul",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Doda",
    "stateSlug": ""
  },
  {
    "name": "Dumka",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Dungarpur",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Durg",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Durgapur",
    "stateSlug": "West Bengal"
  },
  {
    "name": "East champaran",
    "stateSlug": "Bihar"
  },
  {
    "name": "East delhi",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "East godavari",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "East midnapore",
    "stateSlug": "West Bengal"
  },
  {
    "name": "East siang",
    "stateSlug": ""
  },
  {
    "name": "East sikkim",
    "stateSlug": "Sikkim"
  },
  {
    "name": "Eluru",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Ernakulam",
    "stateSlug": "Kerala"
  },
  {
    "name": "Erode",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Etah",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Etawah",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Faizabad",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Faridabad",
    "stateSlug": "Haryana"
  },
  {
    "name": "Faridkot",
    "stateSlug": "Punjab"
  },
  {
    "name": "Farrukhabad",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Fatehabad",
    "stateSlug": "Haryana"
  },
  {
    "name": "Fatehgarh sahib",
    "stateSlug": "Punjab"
  },
  {
    "name": "Fatehpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Fazilka",
    "stateSlug": "Punjab"
  },
  {
    "name": "Firozabad",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Firozpur",
    "stateSlug": "Punjab"
  },
  {
    "name": "Gadag",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Gadchiroli",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Gadwal",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Gajapati",
    "stateSlug": "Odisha"
  },
  {
    "name": "Gajapati",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Gandhi nagar",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Gandhinagar",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Gangtok",
    "stateSlug": "Sikkim"
  },
  {
    "name": "Ganjam",
    "stateSlug": "Odisha"
  },
  {
    "name": "Gaya",
    "stateSlug": "Bihar"
  },
  {
    "name": "Ghaziabad",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Ghazipur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Giridh",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Giridih",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Goalpara",
    "stateSlug": "Assam"
  },
  {
    "name": "Golaghat",
    "stateSlug": "Assam"
  },
  {
    "name": "Gonda",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Gondia",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Gorakhpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Greater Noida",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Gulbarga",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Guna",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Guntur",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Gurdaspur",
    "stateSlug": "Punjab"
  },
  {
    "name": "Gurgaon",
    "stateSlug": "Haryana"
  },
  {
    "name": "Gurgaon",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "Guwahati",
    "stateSlug": "Assam"
  },
  {
    "name": "Gwalior",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Hailakandi",
    "stateSlug": "Assam"
  },
  {
    "name": "Haldwani",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Hamirpur",
    "stateSlug": "Himachal Pradesh"
  },
  {
    "name": "Hanamkonda",
    "stateSlug": "Telangana"
  },
  {
    "name": "Hanumangarh",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Hapur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Hardoi",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Haridwar",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Hassan",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Hathras",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Haveri",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Hazaribag",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Hazaribagh",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Hindupur",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Hingoli",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Hisar",
    "stateSlug": "Haryana"
  },
  {
    "name": "Hooghly",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Hosapete",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Hoshiarpur",
    "stateSlug": "Punjab"
  },
  {
    "name": "Hosiarpur",
    "stateSlug": "Punjab"
  },
  {
    "name": "Howrah",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Hubli",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Hugli",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Hyderabad",
    "stateSlug": "Telangana"
  },
  {
    "name": "Hyderabad",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Idukki",
    "stateSlug": "Kerala"
  },
  {
    "name": "Imphal",
    "stateSlug": "Manipur"
  },
  {
    "name": "Indore",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Itanagar",
    "stateSlug": ""
  },
  {
    "name": "Jabalpur",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Jagdalpur",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Jaipur",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Jajapur",
    "stateSlug": "Odisha"
  },
  {
    "name": "Jalandhar",
    "stateSlug": "Punjab"
  },
  {
    "name": "Jalaun",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Jalgaon",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Jalna",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Jalpaiguri",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Jammu",
    "stateSlug": ""
  },
  {
    "name": "Jamnagar",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Jamshedpur",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Jamui",
    "stateSlug": "Bihar"
  },
  {
    "name": "Jaunpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Jhabua",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Jhajjar",
    "stateSlug": "Haryana"
  },
  {
    "name": "Jhalawar",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Jhansi",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Jhansi",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Jharsuguda",
    "stateSlug": "Odisha"
  },
  {
    "name": "Jhujhunu",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Jind",
    "stateSlug": "Haryana"
  },
  {
    "name": "Jodhpur",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Jorhat",
    "stateSlug": "Assam"
  },
  {
    "name": "Junagadh",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Kachchh",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Kadapa",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Kaimur bhabua",
    "stateSlug": "Bihar"
  },
  {
    "name": "Kaithal",
    "stateSlug": "Haryana"
  },
  {
    "name": "Kakinada",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Kalaburagi",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Kalady",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kalahandi",
    "stateSlug": "Odisha"
  },
  {
    "name": "Kalamassery",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kalitheerthalkuppam",
    "stateSlug": "Union Territory of Puducherry"
  },
  {
    "name": "Kamareddy",
    "stateSlug": "Telangana"
  },
  {
    "name": "Kamrup",
    "stateSlug": "Assam"
  },
  {
    "name": "Kancheepuram",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Kanchipuram",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Kandhamal",
    "stateSlug": "Odisha"
  },
  {
    "name": "Kangayam",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Kangra",
    "stateSlug": "Himachal Pradesh"
  },
  {
    "name": "Kanker",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Kannauj",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Kannur",
    "stateSlug": "Telangana"
  },
  {
    "name": "Kannur",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kanpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Kanshiram nagar",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Kanyakumari",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Kapurthala",
    "stateSlug": "Punjab"
  },
  {
    "name": "Karad",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Karaikal",
    "stateSlug": "Union Territory of Puducherry"
  },
  {
    "name": "Karaikudi",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Karauli",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Karbi anglong",
    "stateSlug": "Assam"
  },
  {
    "name": "Karim nagar",
    "stateSlug": "Telangana"
  },
  {
    "name": "Karimganj",
    "stateSlug": "Assam"
  },
  {
    "name": "Karimnagar",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Karimnagar",
    "stateSlug": "Telangana"
  },
  {
    "name": "Karjat",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Karnal",
    "stateSlug": "Haryana"
  },
  {
    "name": "Karnal",
    "stateSlug": "Punjab"
  },
  {
    "name": "Karur",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Kasaragod",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kasargod",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kashipur",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Kathua",
    "stateSlug": ""
  },
  {
    "name": "Katihar",
    "stateSlug": "Bihar"
  },
  {
    "name": "Katni",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Kaushambi",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Kendujhar",
    "stateSlug": "Odisha"
  },
  {
    "name": "Khammam",
    "stateSlug": "Telangana"
  },
  {
    "name": "Khammam",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Khandwa",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Kharagpur",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Khargone",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Kheda",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Khorda",
    "stateSlug": "Odisha"
  },
  {
    "name": "Kishanganj",
    "stateSlug": "Bihar"
  },
  {
    "name": "Kochi",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kodagu",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Kodaikanal",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Koderma",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Kohima",
    "stateSlug": "Nagaland"
  },
  {
    "name": "Kokrajhar",
    "stateSlug": "Assam"
  },
  {
    "name": "Kolar",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Kolhapur",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Kolkata",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Kollam",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kollam",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Koraput",
    "stateSlug": "Odisha"
  },
  {
    "name": "Korba",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Kota",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Kottayam",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kozhikode",
    "stateSlug": "Kerala"
  },
  {
    "name": "Krishna",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Krishnagiri",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Kupwara",
    "stateSlug": ""
  },
  {
    "name": "Kurnool",
    "stateSlug": "Kerala"
  },
  {
    "name": "Kurnool",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Kurukshetra",
    "stateSlug": "Haryana"
  },
  {
    "name": "Kushinagar",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Kuttikkanam",
    "stateSlug": "Kerala"
  },
  {
    "name": "Ladnun",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Lakhimpur",
    "stateSlug": "Assam"
  },
  {
    "name": "Lakhimpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Lalitpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Latur",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Lucknow",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Ludhiana",
    "stateSlug": "Punjab"
  },
  {
    "name": "Machilipatnam",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Madhepura",
    "stateSlug": "Bihar"
  },
  {
    "name": "Madhubani",
    "stateSlug": "Bihar"
  },
  {
    "name": "Madikeri",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Madurai",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Mahabub nagar",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Mahabub nagar",
    "stateSlug": "Telangana"
  },
  {
    "name": "Maharajganj",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Mahasamund",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Mahendragarh",
    "stateSlug": "Haryana"
  },
  {
    "name": "Mahesana",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Mainpuri",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Malappuram",
    "stateSlug": "Kerala"
  },
  {
    "name": "Malda",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Malegaon",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Mandi",
    "stateSlug": "Himachal Pradesh"
  },
  {
    "name": "Mandi",
    "stateSlug": "Punjab"
  },
  {
    "name": "Mandsaur",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Mandya",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Mangalore",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Manipal",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Mansa",
    "stateSlug": "Punjab"
  },
  {
    "name": "Marigaon",
    "stateSlug": "Goa"
  },
  {
    "name": "Marigaon",
    "stateSlug": "Assam"
  },
  {
    "name": "Mathura",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Mau",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Mayurbhanj",
    "stateSlug": "Odisha"
  },
  {
    "name": "Medak",
    "stateSlug": "Telangana"
  },
  {
    "name": "Medak",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Meerut",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Mewat",
    "stateSlug": "Haryana"
  },
  {
    "name": "Miraj",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Mirzapur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Moga",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Moga",
    "stateSlug": "Punjab"
  },
  {
    "name": "Mohali",
    "stateSlug": "Punjab"
  },
  {
    "name": "Mokokchung",
    "stateSlug": "Nagaland"
  },
  {
    "name": "Moradabad",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Morena",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Muktsar",
    "stateSlug": "Punjab"
  },
  {
    "name": "Mumbai",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Mumbai",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Munger",
    "stateSlug": "Bihar"
  },
  {
    "name": "Murshidabad",
    "stateSlug": "Odisha"
  },
  {
    "name": "Murshidabad",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Muzaffaranagar",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Muzaffarpur",
    "stateSlug": "Bihar"
  },
  {
    "name": "Mylavaram",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Mysore",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Mysuru",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Nadia",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Nadia",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Nadiad",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Nagaon",
    "stateSlug": "Assam"
  },
  {
    "name": "Nagapattinam",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Nagaur",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Nagpur",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Nainital",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Nalanda",
    "stateSlug": "Bihar"
  },
  {
    "name": "Nalgonda",
    "stateSlug": "Telangana"
  },
  {
    "name": "Namakkal",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Nanded",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Nandurbar",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Narayanpur",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Narsinghpur",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Nashik",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Nasik",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Navsari",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Nawada",
    "stateSlug": "Bihar"
  },
  {
    "name": "Nawanshahr",
    "stateSlug": "Punjab"
  },
  {
    "name": "Nayagarh",
    "stateSlug": "Odisha"
  },
  {
    "name": "Neemuch",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Nellore",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "New delhi",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "Nizamabad",
    "stateSlug": "Telangana"
  },
  {
    "name": "Nizamabad",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Nizambad",
    "stateSlug": "Telangana"
  },
  {
    "name": "Nizambad",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Noida",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Noida",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "North 24 parganas",
    "stateSlug": "West Bengal"
  },
  {
    "name": "North dinajpur",
    "stateSlug": "West Bengal"
  },
  {
    "name": "North goa",
    "stateSlug": "Goa"
  },
  {
    "name": "North west delhi",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "Ooty",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Osmanabad",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Palakkad",
    "stateSlug": "Kerala"
  },
  {
    "name": "Palamau",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Palghar",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Pali",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Pali",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Panaji",
    "stateSlug": "Goa"
  },
  {
    "name": "Panch mahals",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Panchkula",
    "stateSlug": "Haryana"
  },
  {
    "name": "Panipat",
    "stateSlug": "Haryana"
  },
  {
    "name": "Panna",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Panna",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Papum pare",
    "stateSlug": ""
  },
  {
    "name": "Parbhani",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Patan",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Pathanamthitta",
    "stateSlug": "Kerala"
  },
  {
    "name": "Pathankot",
    "stateSlug": "Punjab"
  },
  {
    "name": "Patiala",
    "stateSlug": "Punjab"
  },
  {
    "name": "Patna",
    "stateSlug": "Bihar"
  },
  {
    "name": "Pauri garhwal",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Perambalur",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Pilani",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Pilibhit",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Pithoragarh",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Ponda",
    "stateSlug": "Goa"
  },
  {
    "name": "Pondicherry",
    "stateSlug": "Union Territory of Puducherry"
  },
  {
    "name": "Poonch",
    "stateSlug": ""
  },
  {
    "name": "Porbandar",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Port Blair",
    "stateSlug": "Andaman and Nicobar"
  },
  {
    "name": "Prakasam",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Pratapgarh",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Prayagraj allahabad",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Pudukkottai",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Pune",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Puri",
    "stateSlug": "Odisha"
  },
  {
    "name": "Purnia",
    "stateSlug": "Bihar"
  },
  {
    "name": "Raebareli",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Raichur",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Raigad",
    "stateSlug": "Odisha"
  },
  {
    "name": "Raigad",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Raigarh",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Raigarh(mh)",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Raipur",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Raisen",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Rajkot",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Rajnandgaon",
    "stateSlug": "Chattisgarh"
  },
  {
    "name": "Rajnandgaon",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Rajsamand",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Ramanagar",
    "stateSlug": "Telangana"
  },
  {
    "name": "Ramanagar",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Ramanathapuram",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Ramban",
    "stateSlug": ""
  },
  {
    "name": "Ramgarh",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Rampur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Ranchi",
    "stateSlug": "Jharkhand"
  },
  {
    "name": "Rangareddy",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Rangareddy",
    "stateSlug": "Telangana"
  },
  {
    "name": "Ratlam",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Ratnagiri",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Rayagada",
    "stateSlug": "Odisha"
  },
  {
    "name": "Rewa",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Rewari",
    "stateSlug": "Haryana"
  },
  {
    "name": "Ri bhoi",
    "stateSlug": "Meghalaya"
  },
  {
    "name": "Rishikesh",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Rohtak",
    "stateSlug": "Haryana"
  },
  {
    "name": "Roorkee",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Ropar",
    "stateSlug": "Punjab"
  },
  {
    "name": "Rourkela",
    "stateSlug": "Odisha"
  },
  {
    "name": "Rudrapur",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Rupnagar",
    "stateSlug": "Punjab"
  },
  {
    "name": "Sabarkantha",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Sagar",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Sagar",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Sagar",
    "stateSlug": "West Bengal"
  },
  {
    "name": "Saharanpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Saharsa",
    "stateSlug": "Bihar"
  },
  {
    "name": "Salem",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Samastipur",
    "stateSlug": "Bihar"
  },
  {
    "name": "Sambalpur",
    "stateSlug": "Odisha"
  },
  {
    "name": "Sambhal",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Sangareddy",
    "stateSlug": "Telangana"
  },
  {
    "name": "Sangli",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Sangrur",
    "stateSlug": "Punjab"
  },
  {
    "name": "Saran",
    "stateSlug": "Bihar"
  },
  {
    "name": "Satara",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Satna",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Sawai madhopur",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Secunderabad",
    "stateSlug": "Telangana"
  },
  {
    "name": "Secunderabad",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Sehore",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Seoni",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Shahdol",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Shahjahanpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Shajapur",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Shillong",
    "stateSlug": "Meghalaya"
  },
  {
    "name": "Shimla",
    "stateSlug": "Himachal Pradesh"
  },
  {
    "name": "Shimoga",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Shivamogga",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Shivpuri",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Shivpuri",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Siddharthnagar",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Siddhpur",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Siddipet",
    "stateSlug": "Telangana"
  },
  {
    "name": "Sidhi",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Sikandrabad",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Sikar",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Silchar",
    "stateSlug": "Assam"
  },
  {
    "name": "Sindhudurg",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Singrauli",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Sirmaur",
    "stateSlug": "Himachal Pradesh"
  },
  {
    "name": "Sirohi",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Sirsa",
    "stateSlug": "Haryana"
  },
  {
    "name": "Sitapur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Sivaganga",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Siwan",
    "stateSlug": "Bihar"
  },
  {
    "name": "Siwan",
    "stateSlug": "Haryana"
  },
  {
    "name": "Solan",
    "stateSlug": "Himachal Pradesh"
  },
  {
    "name": "Solapur",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Sonapur",
    "stateSlug": "Odisha"
  },
  {
    "name": "Sonbhadra",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Sonipat",
    "stateSlug": "Haryana"
  },
  {
    "name": "Sonitpur",
    "stateSlug": "Assam"
  },
  {
    "name": "South 24 Parganas",
    "stateSlug": "West Bengal"
  },
  {
    "name": "South delhi",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "South goa",
    "stateSlug": "Goa"
  },
  {
    "name": "South sikkim",
    "stateSlug": "Sikkim"
  },
  {
    "name": "South west delhi",
    "stateSlug": "National Capital Territory of Delhi"
  },
  {
    "name": "Sri ganganagar",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Sriganganagar",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Srikakulam",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Srikakulam",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Srinagar",
    "stateSlug": ""
  },
  {
    "name": "Srinagar",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Srinagar Garhwal",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Stn. jadcherla",
    "stateSlug": "Telangana"
  },
  {
    "name": "Sultanpur",
    "stateSlug": "Punjab"
  },
  {
    "name": "Sultanpur",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Sundergarh",
    "stateSlug": "Odisha"
  },
  {
    "name": "Surat",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Surendra nagar",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Suryapet",
    "stateSlug": "Telangana"
  },
  {
    "name": "Tarn taran",
    "stateSlug": "Punjab"
  },
  {
    "name": "Tehri garhwal",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Tekkali",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Thalassery",
    "stateSlug": "Kerala"
  },
  {
    "name": "Thane",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Thanjavur",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Theni",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Thiruvalla",
    "stateSlug": "Kerala"
  },
  {
    "name": "Thiruvallur",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Thiruvananthapuram",
    "stateSlug": "Kerala"
  },
  {
    "name": "Thodapuzha",
    "stateSlug": "Kerala"
  },
  {
    "name": "Thrissur",
    "stateSlug": "Kerala"
  },
  {
    "name": "Tinsukia",
    "stateSlug": "Assam"
  },
  {
    "name": "Tiruchengode",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Tiruchirappalli",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Tirunelveli",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Tirupathi",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Tirupati",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Tiruppur",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Tiruvallur",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Tiruvannamalai",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Tiruvarur",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Tonk",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Trichy",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Trivandrum",
    "stateSlug": "Kerala"
  },
  {
    "name": "Tumakuru",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Tura",
    "stateSlug": "Meghalaya"
  },
  {
    "name": "Tuticorin",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Udaipur",
    "stateSlug": "Rajasthan"
  },
  {
    "name": "Udham singh nagar",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Udhampur",
    "stateSlug": ""
  },
  {
    "name": "Udhampur",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Udupi",
    "stateSlug": "Kerala"
  },
  {
    "name": "Udupi",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Ujjain",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Una",
    "stateSlug": "Himachal Pradesh"
  },
  {
    "name": "Unnao",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Uttara kannada",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Uttarkashi",
    "stateSlug": "Uttarakhand"
  },
  {
    "name": "Vadodara",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Vaishali",
    "stateSlug": "Bihar"
  },
  {
    "name": "Valsad",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Varanasi",
    "stateSlug": "Uttar Pradesh"
  },
  {
    "name": "Vazhakulam",
    "stateSlug": "Kerala"
  },
  {
    "name": "Vellore",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Vidisha",
    "stateSlug": "Madhya Pradesh"
  },
  {
    "name": "Vijayawada",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Vikarabad",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Vikarabad",
    "stateSlug": "Telangana"
  },
  {
    "name": "Villupuram",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Virudhunagar",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Visakhapatnam",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Visakhapatnam",
    "stateSlug": "Tamil Nadu"
  },
  {
    "name": "Vizianagaram",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "Wadala",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Wadhwan",
    "stateSlug": "Gujarat"
  },
  {
    "name": "Wanaparthy",
    "stateSlug": "Telangana"
  },
  {
    "name": "Warangal",
    "stateSlug": "Telangana"
  },
  {
    "name": "Wardha",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Washim",
    "stateSlug": "Maharashtra"
  },
  {
    "name": "Wayanad",
    "stateSlug": "Kerala"
  },
  {
    "name": "West champaran",
    "stateSlug": "Bihar"
  },
  {
    "name": "West godavari",
    "stateSlug": "Andhra Pradesh"
  },
  {
    "name": "West kameng",
    "stateSlug": ""
  },
  {
    "name": "West midnapore",
    "stateSlug": "West Bengal"
  },
  {
    "name": "West sikkim",
    "stateSlug": "Sikkim"
  },
  {
    "name": "Yadgir",
    "stateSlug": "Karnataka"
  },
  {
    "name": "Yamuna Nagar",
    "stateSlug": "Haryana"
  },
  {
    "name": "Yamunanagar",
    "stateSlug": "Haryana"
  },
  {
    "name": "Yavatmal",
    "stateSlug": "Maharashtra"
  }
] as const;
