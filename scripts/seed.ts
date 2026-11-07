/* eslint-disable */
// TrendoraNews seed — run with: npx tsx scripts/seed.ts
import "dotenv/config";
import { db } from "../src/db";
import {
  users, sessions, categories, tags, articles, articleTags, articleSources,
  comments, breakingNews, breakingUpdates, media, newsletter, searches,
  notifications, pageViews, factChecks, explainers, countries, animals,
  spaceObjects, timelineEvents, likes, bookmarks, reads,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { slugify, readingTimeMinutes } from "../src/lib/utils";
import { eq, sql } from "drizzle-orm";

const CATS: { name: string; slug: string; parent?: string; color: string; icon: string; desc: string }[] = [
  { name: "Bangladesh", slug: "bangladesh", color: "#dc2626", icon: "bd", desc: "News from Bangladesh — national, politics and economy." },
  { name: "National", slug: "national", parent: "bangladesh", color: "#b91c1c", icon: "flag", desc: "National affairs of Bangladesh." },
  { name: "Politics", slug: "politics", parent: "bangladesh", color: "#991b1b", icon: "landmark", desc: "Bangladeshi politics and governance." },
  { name: "Economy", slug: "economy", parent: "bangladesh", color: "#7f1d1d", icon: "chart", desc: "Economy, trade and finance of Bangladesh." },
  { name: "World", slug: "world", color: "#2563eb", icon: "globe", desc: "International news from every continent." },
  { name: "Asia", slug: "asia", parent: "world", color: "#1d4ed8", icon: "asia", desc: "News from Asia." },
  { name: "Europe", slug: "europe", parent: "world", color: "#1e40af", icon: "europe", desc: "News from Europe." },
  { name: "Americas", slug: "americas", parent: "world", color: "#1e3a8a", icon: "americas", desc: "News from North & South America." },
  { name: "Africa", slug: "africa", parent: "world", color: "#172554", icon: "africa", desc: "News from Africa." },
  { name: "Business", slug: "business", color: "#059669", icon: "briefcase", desc: "Business, finance and markets." },
  { name: "Finance", slug: "finance", parent: "business", color: "#047857", icon: "coins", desc: "Banking, stocks and personal finance." },
  { name: "Markets", slug: "markets", parent: "business", color: "#065f46", icon: "trend", desc: "Stock markets and commodities." },
  { name: "Industry", slug: "industry", parent: "business", color: "#064e3b", icon: "factory", desc: "Industry and manufacturing." },
  { name: "Technology", slug: "technology", color: "#7c3aed", icon: "cpu", desc: "Tech news, gadgets and innovation." },
  { name: "AI", slug: "ai", parent: "technology", color: "#6d28d9", icon: "brain", desc: "Artificial intelligence." },
  { name: "Gadgets", slug: "gadgets", parent: "technology", color: "#5b21b6", icon: "phone", desc: "Phones, laptops and gadgets." },
  { name: "Innovation", slug: "innovation", parent: "technology", color: "#4c1d95", icon: "bulb", desc: "Startups and innovation." },
  { name: "Entertainment", slug: "entertainment", color: "#db2777", icon: "star", desc: "Celebrity, movies and music." },
  { name: "Celebrity", slug: "celebrity", parent: "entertainment", color: "#be185d", icon: "sparkles", desc: "Celebrity news." },
  { name: "Movies", slug: "movies", parent: "entertainment", color: "#9d174d", icon: "film", desc: "Movies and cinema." },
  { name: "Music", slug: "music", parent: "entertainment", color: "#831843", icon: "music", desc: "Music industry." },
  { name: "History", slug: "history", color: "#b45309", icon: "scroll", desc: "Ancient, medieval and modern history." },
  { name: "Ancient", slug: "ancient", parent: "history", color: "#92400e", icon: "pyramid", desc: "Ancient civilizations." },
  { name: "Medieval", slug: "medieval", parent: "history", color: "#78350f", icon: "castle", desc: "The medieval era." },
  { name: "Modern", slug: "modern", parent: "history", color: "#451a03", icon: "landmark", desc: "Modern history." },
  { name: "Animals", slug: "animals", color: "#16a34a", icon: "paw", desc: "Wildlife, pets and marine life." },
  { name: "Wildlife", slug: "wildlife", parent: "animals", color: "#15803d", icon: "lion", desc: "Wild animals." },
  { name: "Pets", slug: "pets", parent: "animals", color: "#166534", icon: "dog", desc: "Pets and companions." },
  { name: "Marine Life", slug: "marine-life", parent: "animals", color: "#14532d", icon: "fish", desc: "Oceans and marine animals." },
  { name: "Geography", slug: "geography", color: "#0d9488", icon: "map", desc: "Countries, mountains and oceans." },
  { name: "Countries", slug: "countries", parent: "geography", color: "#0f766e", icon: "flag", desc: "Country profiles." },
  { name: "Mountains", slug: "mountains", parent: "geography", color: "#115e59", icon: "mountain", desc: "Mountains of the world." },
  { name: "Oceans", slug: "oceans", parent: "geography", color: "#134e4a", icon: "waves", desc: "Oceans and seas." },
  { name: "Science", slug: "science", color: "#0284c7", icon: "flask", desc: "Space, physics and research." },
  { name: "Space", slug: "space", parent: "science", color: "#0369a1", icon: "rocket", desc: "Space exploration." },
  { name: "Physics", slug: "physics", parent: "science", color: "#075985", icon: "atom", desc: "Physics." },
  { name: "Research", slug: "research", parent: "science", color: "#0c4a6e", icon: "microscope", desc: "Scientific research." },
  { name: "Sports", slug: "sports", color: "#ea580c", icon: "ball", desc: "Football, cricket and more." },
  { name: "Football", slug: "football", parent: "sports", color: "#c2410c", icon: "soccer", desc: "Football." },
  { name: "Cricket", slug: "cricket", parent: "sports", color: "#9a3412", icon: "cricket", desc: "Cricket." },
  { name: "Other Sports", slug: "other-sports", parent: "sports", color: "#7c2d12", icon: "trophy", desc: "All other sports." },
  { name: "Education", slug: "education", color: "#4f46e5", icon: "book", desc: "Admission, research and learning." },
  { name: "Admission", slug: "admission", parent: "education", color: "#4338ca", icon: "cap", desc: "University admissions." },
  { name: "Learning", slug: "learning", parent: "education", color: "#3730a3", icon: "school", desc: "Learning resources." },
  { name: "Research", slug: "research-edu", parent: "education", color: "#312e81", icon: "flask", desc: "Education research." },
  { name: "Lifestyle", slug: "lifestyle", color: "#be123c", icon: "heart", desc: "Travel, culture and fashion." },
  { name: "Travel", slug: "travel", parent: "lifestyle", color: "#9f1239", icon: "plane", desc: "Travel guides." },
  { name: "Culture", slug: "culture", parent: "lifestyle", color: "#881337", icon: "mask", desc: "Culture and festivals." },
  { name: "Fashion", slug: "fashion", parent: "lifestyle", color: "#701a75", icon: "shirt", desc: "Fashion." },
  { name: "Environment", slug: "environment", color: "#65a30d", icon: "leaf", desc: "Climate, nature and conservation." },
  { name: "Climate", slug: "climate", parent: "environment", color: "#4d7c0f", icon: "cloud", desc: "Climate change." },
  { name: "Nature", slug: "nature", parent: "environment", color: "#3f6212", icon: "tree", desc: "Nature." },
  { name: "Conservation", slug: "conservation", parent: "environment", color: "#365314", icon: "shield", desc: "Conservation." },
  { name: "Health", slug: "health", color: "#0891b2", icon: "heart-pulse", desc: "Wellness and medical research." },
  { name: "Wellness", slug: "wellness", parent: "health", color: "#0e7490", icon: "spa", desc: "Wellness." },
  { name: "Medical Research", slug: "medical-research", parent: "health", color: "#155e75", icon: "pill", desc: "Medical research." },
  { name: "Opinion", slug: "opinion", color: "#a21caf", icon: "pen", desc: "Editorials and guest columns." },
  { name: "Editorial", slug: "editorial", parent: "opinion", color: "#86198f", icon: "pen-line", desc: "Editorials." },
  { name: "Guest Column", slug: "guest-column", parent: "opinion", color: "#701a75", icon: "quote", desc: "Guest columns." },
  { name: "Investigation", slug: "investigation", color: "#78716c", icon: "search", desc: "Special reports and fact checks." },
  { name: "Special Reports", slug: "special-reports", parent: "investigation", color: "#57534e", icon: "folder", desc: "Special reports." },
  { name: "Fact Check", slug: "fact-check", parent: "investigation", color: "#44403c", icon: "badge-check", desc: "Fact checking." },
];

const STAFF = [
  { name: "Ayesha Rahman", email: "admin@trendora.news", role: "admin", verified: true, bio: "Editor-in-chief of TrendoraNews. 15 years in journalism." },
  { name: "Tanvir Hasan", email: "editor@trendora.news", role: "editor", verified: true, bio: "Senior news editor, Dhaka desk." },
  { name: "Mehedi Hasan", email: "senior@trendora.news", role: "senior_editor", verified: true, bio: "Senior editor — world affairs." },
  { name: "Sadia Karim", email: "reporter@trendora.news", role: "reporter", verified: true, bio: "Staff reporter covering Bangladesh politics." },
  { name: "Rafiul Islam", email: "writer@trendora.news", role: "writer", verified: true, bio: "Feature writer — culture & lifestyle." },
  { name: "Nusrat Jahan", email: "factcheck@trendora.news", role: "fact_checker", verified: true, bio: "Lead fact checker at the TrendoraNews verification desk." },
  { name: "Imran Kabir", email: "publisher@trendora.news", role: "publisher", verified: true, bio: "Publisher." },
  { name: "Demo Reader", email: "reader@trendora.news", role: "user", verified: false, bio: "News enthusiast." },
];

type A = {
  title: string; cat: string; country: string; region: string; type: string;
  hoursAgo: number; featured?: boolean; breaking?: boolean; editor?: boolean;
  fact?: string; tags: string[]; excerpt: string; body?: string[];
};

const ARTICLES: A[] = [
  { title: "Padma Bridge rail link opens, cutting Dhaka–Khulna travel time in half", cat: "national", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 1, featured: true, breaking: true, fact: "verified", tags: ["infrastructure", "transport", "bangladesh"], excerpt: "The long-awaited rail link over the Padma Bridge began commercial operations today, slashing travel time between Dhaka and Khulna to under four hours.", body: ["The first passenger train crossed the Padma Bridge at dawn on Saturday, marking a new era for Bangladesh's rail network.", "Officials say the 172-kilometre route will carry over 20,000 passengers daily and boost trade between the capital and the south-western region.", "> \"This is the biggest infrastructure milestone since the bridge itself,\" said the rail minister at the inauguration.", "Economists estimate the link could add up to 1% to national GDP through faster freight movement."] },
  { title: "Bangladesh wins historic series against India in T20 cricket", cat: "cricket", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 3, featured: true, breaking: true, fact: "verified", tags: ["cricket", "bangladesh", "sports"], excerpt: " Tigers clinched a 2–1 series victory with a thrilling seven-run win in the decider at Mirpur.", body: ["Bangladesh chased down 168 in the final over, with Jaker Ali smashing 24 runs off the last six balls.", "It is Bangladesh's first home T20 series win against India.", "> \"We believed till the last ball,\" said captain Najmul Hossain Shanto."] },
  { title: "Dhaka Stock Exchange hits record high as banking stocks rally", cat: "markets", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 5, fact: "verified", tags: ["stocks", "economy", "dse"], excerpt: "The DSEX index crossed 7,400 points for the first time, driven by strong quarterly earnings from banks.", body: ["Banking shares rose 4.2% on Thursday after several lenders reported record profits.", "Analysts credit improved remittance inflows and stable policy rates.", "Turnover crossed Tk 2,500 crore, the highest this year."] },
  { title: "Election Commission announces schedule for next national election", cat: "politics", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 8, featured: true, fact: "pending", tags: ["election", "politics", "bangladesh"], excerpt: "The EC said voting will take place in the second week of February, with the model code of conduct in force from next month.", body: ["The commission unveiled the full roadmap, including nomination deadlines and scrutiny dates.", "Opposition parties welcomed the announcement but demanded a neutral caretaker administration.", "## Key dates\n\n- Nomination filing: mid-January\n- Scrutiny: two days after filing\n- Voting: second week of February"] },
  { title: "Remittance inflows cross $2 billion in a single month for the first time", cat: "economy", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 10, fact: "verified", tags: ["remittance", "economy", "forex"], excerpt: "Expatriate workers sent home a record $2.1 billion in the last month, boosting foreign reserves.", body: ["The central bank confirmed the milestone, attributing it to formal channel incentives.", "Reserves now stand comfortably above $20 billion.", "Economists say sustained remittances will help stabilise the taka."] },
  { title: "Metro Rail Phase 2 approved: Uttara to Motijheel extension to begin next year", cat: "national", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 14, tags: ["metro", "dhaka", "transport"], excerpt: "The government approved the second phase of the metro rail, extending the line deep into old Dhaka.", body: ["The extension will add 8 new stations.", "Officials project completion by 2030.", "> \"Old Dhaka's traffic nightmare finally has an end date.\""] },
  { title: "Cyclone preparedness: coastal districts complete mock drills ahead of season", cat: "climate", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 20, fact: "verified", tags: ["cyclone", "disaster", "climate"], excerpt: "Fifty-six coastal upazilas completed cyclone simulation drills this week as the Bay of Bengal warms.", body: ["Over 100,000 volunteers participated in the week-long programme.", "Early warning systems were tested in all coastal shelters.", "Authorities urged residents to keep emergency kits ready."] },
  { title: "Hilsa exports earn record revenue as global demand surges", cat: "economy", country: "Bangladesh", region: "South Asia", type: "feature", hoursAgo: 26, tags: ["hilsa", "export", "economy"], excerpt: "Bangladesh's prized hilsa fish fetched record prices in Middle Eastern markets this season.", body: ["Exporters shipped 8,000 tonnes, earning over $60 million.", "The government is considering GI protection for hilsa in more markets.", "Fishermen in Chandpur report the best season in a decade."] },
  { title: "Bangladesh, India sign water-sharing pact for Teesta river", cat: "asia", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 30, fact: "verified", tags: ["india", "water", "diplomacy"], excerpt: "The two countries signed a 15-year interim agreement on Teesta water sharing after a decade of negotiations.", body: ["The pact guarantees Bangladesh a fair share during the dry season.", "Both prime ministers hailed it as a new chapter in bilateral ties.", "Farmers in Rangpur welcomed the news."] },
  { title: "NASA's Artemis III mission targets first crewed Moon landing since 1972", cat: "space", country: "United States", region: "North America", type: "news", hoursAgo: 2, featured: true, fact: "verified", tags: ["nasa", "moon", "space"], excerpt: "NASA confirmed the Artemis III crew and the landing site near the lunar south pole.", body: ["Four astronauts will spend about a week on the Moon.", "The mission will test systems for a future Mars journey.", "## Why the south pole?\n\n- Water ice deposits could fuel future missions\n- Permanently shadowed craters hold ancient ice"] },
  { title: "James Webb telescope spots oldest galaxy yet, 300 million years after Big Bang", cat: "space", country: "United States", region: "Global", type: "news", hoursAgo: 6, fact: "verified", tags: ["jwst", "galaxy", "science"], excerpt: "The JWST has detected a galaxy formed just 300 million years after the Big Bang, breaking its own record.", body: ["The galaxy, named JADES-GS-z14-0, challenges models of early galaxy formation.", "Scientists say it was surprisingly bright and massive.", "> \"The early universe was busier than we thought.\""] },
  { title: "AI model passes medical licensing exam with 90% score", cat: "ai", country: "United States", region: "North America", type: "news", hoursAgo: 4, featured: true, breaking: true, fact: "verified", tags: ["ai", "health", "tech"], excerpt: "A new large language model outperformed most human doctors on a standardized medical licensing exam.", body: ["The model scored 90%, above the average pass mark of 60%.", "Researchers caution it must still be supervised by clinicians.", "## What it means\n\n- Faster diagnosis support in understaffed clinics\n- Risk of over-reliance without human review"] },
  { title: "New smartphone chip promises 40% faster on-device AI", cat: "gadgets", country: "South Korea", region: "East Asia", type: "video", hoursAgo: 9, tags: ["smartphone", "chip", "ai"], excerpt: "A next-gen mobile processor unveiled at Seoul Tech Week doubles neural engine performance.", body: ["The chip enables real-time translation and photo editing without cloud servers.", "Devices arrive early next year.", "Battery life is claimed to improve by 15%."] },
  { title: "Bangladesh tech startup raises $50 million in Series B", cat: "innovation", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 12, fact: "verified", tags: ["startup", "funding", "tech"], excerpt: "A Dhaka-based fintech startup became the country's first unicorn-adjacent company after a record round.", body: ["The funding will expand operations to five new countries.", "The startup now serves 8 million users.", "> \"Bangladesh's tech winter is over.\""] },
  { title: "European Union passes landmark AI Act, first of its kind", cat: "europe", country: "Germany", region: "Europe", type: "news", hoursAgo: 7, featured: true, fact: "verified", tags: ["eu", "ai", "regulation"], excerpt: "The EU AI Act bans high-risk uses like emotion recognition in public spaces and mandates transparency for generative AI.", body: ["Companies have up to two years to comply.", "Fines can reach 7% of global turnover.", "## Banned practices\n\n- Social scoring by governments\n- Real-time facial recognition in public (with exceptions)\n- Manipulative AI systems"] },
  { title: "UK economy returns to growth with 0.3% quarterly expansion", cat: "europe", country: "United Kingdom", region: "Europe", type: "news", hoursAgo: 11, tags: ["uk", "economy", "gdp"], excerpt: "The Office for National Statistics confirmed the UK avoided recession, driven by services and construction.", body: ["Inflation fell to its lowest in two years.", "The pound strengthened against the dollar.", "Markets expect interest rates to stay steady."] },
  { title: "Champions League: dramatic comeback sees underdogs reach semifinals", cat: "football", country: "Spain", region: "Europe", type: "news", hoursAgo: 5, fact: "verified", tags: ["football", "ucl", "sports"], excerpt: "A three-goal second-half comeback stunned the defending champions in Madrid.", body: ["The visitors scored three times in 12 minutes.", "The final will be played at Wembley.", "> \"Never write them off.\""] },
  { title: "ICC World Cup qualifiers: Nepal books place in 2027 tournament", cat: "cricket", country: "Nepal", region: "South Asia", type: "news", hoursAgo: 16, fact: "verified", tags: ["cricket", "nepal", "worldcup"], excerpt: "Nepal's stunning run in the qualifiers in Zimbabwe secured a historic World Cup berth.", body: ["Nepal beat Scotland by 47 runs in the final qualifier.", "It will be Nepal's first 50-over World Cup.", "Fans in Kathmandu celebrated into the night."] },
  { title: "Oil prices fall below $70 as OPEC+ extends production cuts", cat: "markets", country: "Saudi Arabia", region: "Middle East", type: "news", hoursAgo: 13, tags: ["oil", "opec", "markets"], excerpt: "Brent crude dropped 3% after OPEC+ agreed to extend cuts through next year.", body: ["Analysts expect prices to stay range-bound.", "Lower oil prices ease pressure on import bills in Asia.", "Gasoline prices may fall at the pump next week."] },
  { title: "Global shipping costs normalize as Red Sea traffic reroutes stabilize", cat: "industry", country: "UAE", region: "Middle East", type: "news", hoursAgo: 18, tags: ["shipping", "trade", "logistics"], excerpt: "Freight rates on Asia–Europe routes have fallen 40% from their January peak.", body: ["Longer routes around Africa are now factored into schedules.", "Retailers expect lower prices on imported goods.", "Insurance costs remain elevated but stable."] },
  { title: "New vaccine shows 80% efficacy against dengue in large trial", cat: "medical-research", country: "Brazil", region: "South America", type: "news", hoursAgo: 22, featured: true, fact: "verified", tags: ["vaccine", "health", "dengue"], excerpt: "A phase 3 trial across five countries found the new dengue vaccine highly effective in adolescents.", body: ["The vaccine uses a weakened live virus.", "Regulators in Brazil and Thailand will review it within months.", "## Dengue facts\n\n- 400 million infections yearly\n- Climate change is expanding mosquito range"] },
  { title: "Scientists map the complete neural wiring of a fruit fly brain", cat: "research", country: "United Kingdom", region: "Europe", type: "feature", hoursAgo: 28, fact: "verified", tags: ["brain", "science", "connectome"], excerpt: "After four years of work, researchers published the first full connectome of an adult insect brain.", body: ["The map contains 139,000 neurons and 50 million synapses.", "It could unlock understanding of learning and memory.", "> \"A fly brain is small, but it thinks.\""] },
  { title: "Physics breakthrough: room-temperature superconductor claim retracted", cat: "physics", country: "South Korea", region: "East Asia", type: "investigation", hoursAgo: 32, fact: "disputed", tags: ["superconductor", "physics", "science"], excerpt: "The journal that published the LK-99 paper retracted it after labs worldwide failed to reproduce the results.", body: ["The claim had sent superconductor stocks soaring.", "The episode is now a case study in scientific verification.", "Researchers welcome the swift correction process."] },
  { title: "Ancient city of Alexandria's lost library: new underwater discoveries", cat: "ancient", country: "Egypt", region: "Africa", type: "feature", hoursAgo: 36, tags: ["alexandria", "history", "archaeology"], excerpt: "Divers off Egypt's coast have found ruins believed to be part of the ancient port of Alexandria.", body: ["Statues, coins and a sphinx head were recovered.", "The site lies 5 km from the modern coastline.", "Archaeologists call it the most significant find in decades."] },
  { title: "Magna Carta turns 800: how one document shaped modern rights", cat: "medieval", country: "United Kingdom", region: "Europe", type: "feature", hoursAgo: 40, tags: ["history", "rights", "law"], excerpt: "Eight centuries after King John sealed the Magna Carta, its principles still echo in courts worldwide.", body: ["Only four of the original 63 clauses remain in force.", "It established that the king is subject to the law.", "> \"No free man shall be imprisoned except by lawful judgment.\""] },
  { title: "World War II centenary of D-Day preparations: 80 years on", cat: "modern", country: "France", region: "Europe", type: "history", hoursAgo: 44, tags: ["ww2", "dday", "history"], excerpt: "As the 80th anniversary approaches, historians revisit the deception campaign that made D-Day possible.", body: ["Operation Bodyguard fooled Germany about the landing site.", "Inflatable armies and fake radio traffic played key roles.", "Veterans gathered in Normandy for commemorations."] },
  { title: "Royal Bengal Tiger population rises in the Sundarbans", cat: "wildlife", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 15, featured: true, fact: "verified", tags: ["tiger", "sundarbans", "conservation"], excerpt: "The latest census counted 125 tigers in the Bangladeshi Sundarbans, up from 106 in 2018.", body: ["Camera traps covered the entire forest.", "Conservationists credit anti-poaching patrols.", "## Sundarbans facts\n\n- World's largest mangrove forest\n- Shared with India\n- UNESCO World Heritage Site"] },
  { title: "Blue whale spotted off Cox's Bazar for the first time in a decade", cat: "marine-life", country: "Bangladesh", region: "South Asia", type: "video", hoursAgo: 24, fact: "verified", tags: ["whale", "ocean", "bangladesh"], excerpt: "Fishermen captured rare footage of a blue whale feeding in the Bay of Bengal.", body: ["Marine biologists confirmed the sighting from the video.", "The Bay is a known whale habitat but sightings are rare.", "Authorities are considering a marine sanctuary."] },
  { title: "Golden Retrievers top the list of most popular dog breeds in 2026", cat: "pets", country: "United States", region: "North America", type: "feature", hoursAgo: 38, tags: ["dogs", "pets", "lifestyle"], excerpt: "For the 34th consecutive year, the friendly retriever ranks as America's favourite dog.", body: ["Labradors and French Bulldogs follow in second and third.", "Vets praise their temperament with children.", "> \"They're not just pets, they're family.\""] },
  { title: "Mount Everest sees record number of climbers this season", cat: "mountains", country: "Nepal", region: "South Asia", type: "news", hoursAgo: 20, tags: ["everest", "nepal", "mountaineering"], excerpt: "Over 600 climbers received permits for the 2026 spring season on the world's highest peak.", body: ["Nepal collected a record $8 million in permit fees.", "Weather windows were favourable for most of the season.", "Cleanup teams removed 11 tonnes of garbage."] },
  { title: "Mariana Trench: new species discovered at 10,900 meters", cat: "oceans", country: "Japan", region: "East Asia", type: "news", hoursAgo: 34, fact: "verified", tags: ["ocean", "deep-sea", "science"], excerpt: "A Japanese-led expedition filmed three new species of snailfish in the deepest part of the ocean.", body: ["The snailfish live where pressure is 1,000 times sea level.", "Samples will be studied for extremozyme enzymes.", "> \"Life finds a way, even at the bottom of the world.\""] },
  { title: "Sahara Desert blooms after rare rains — satellite images go viral", cat: "nature", country: "Egypt", region: "Africa", type: "gallery", hoursAgo: 42, tags: ["sahara", "desert", "climate"], excerpt: "Unprecedented September rainfall turned parts of the Sahara green for the first time in decades.", body: ["Satellites captured the bloom across Morocco and Algeria.", "Scientists link it to a shifting jet stream.", "Locals celebrated with festivals in oasis towns."] },
  { title: "Dhaka University admission test: record 95,000 applicants", cat: "admission", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 27, tags: ["education", "du", "admission"], excerpt: "A record number of students sat for the DU admission test this year, with just 5,500 seats available.", body: ["Competition ratio reached 17:1 for science units.", "Coaching centres reported a boom in registrations.", "Officials promised a fully digital result process."] },
  { title: "Online learning platforms see 60% growth in rural Bangladesh", cat: "learning", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 33, tags: ["edtech", "learning", "bangladesh"], excerpt: "Cheap mobile data and smartphone penetration are transforming education outside the cities.", body: ["Over 12 million students now use at least one edtech app.", "NGOs partner with platforms to reach girls in remote areas.", "Teachers report better class attendance."] },
  { title: "Cox's Bazar named Asia's best beach destination for 2026", cat: "travel", country: "Bangladesh", region: "South Asia", type: "feature", hoursAgo: 45, fact: "verified", tags: ["travel", "coxsbazar", "tourism"], excerpt: "The world's longest natural sea beach topped the Asia Travel Awards list.", body: ["Tourism arrivals rose 35% year on year.", "New eco-resorts opened along Marine Drive.", "> \"The Bay of Bengal's gift to the world.\""] },
  { title: "Pahela Baishakh celebrated across Bangladesh with record crowds", cat: "culture", country: "Bangladesh", region: "South Asia", type: "gallery", hoursAgo: 48, tags: ["culture", "pohela-boishakh", "festival"], excerpt: "Hundreds of thousands thronged Ramna Batamul for the Bengali New Year parade.", body: ["The Mongol Shobhajatra began at dawn with traditional songs.", "Artisans sold masks and pottery along the route.", "Security was beefed up across the capital."] },
  { title: "Dhaka fashion week showcases sustainable Bangladeshi textiles", cat: "fashion", country: "Bangladesh", region: "South Asia", type: "video", hoursAgo: 50, tags: ["fashion", "dhaka", "sustainable"], excerpt: "Designers wowed the runway with jamdani and muslin made from recycled fibers.", body: ["Ten designers presented zero-waste collections.", "International buyers from Europe attended.", "Organizers plan a twice-yearly event."] },
  { title: "COP31 agreement: nations pledge to triple renewable energy by 2035", cat: "climate", country: "UAE", region: "Global", type: "news", hoursAgo: 9, featured: true, breaking: true, fact: "verified", tags: ["cop31", "climate", "renewables"], excerpt: "Nearly 200 countries signed the Dubai Climate Pact, the most ambitious energy deal in history.", body: ["Solar and wind capacity must triple within a decade.", "The pact also calls for transitioning away from fossil fuels.", "## Key pledges\n\n- Triple renewables by 2035\n- Double energy efficiency\n- Loss & damage fund operationalized"] },
  { title: "Daily 30-minute walk cuts heart disease risk by 25%, study finds", cat: "wellness", country: "United Kingdom", region: "Europe", type: "news", hoursAgo: 25, fact: "verified", tags: ["health", "walking", "wellness"], excerpt: "A 10-year study of 400,000 adults found brisk walking dramatically reduces cardiovascular risk.", body: ["The benefit was seen even without gym exercise.", "Doctors recommend starting with 15 minutes.", "> \"The best exercise is the one you'll actually do.\""] },
  { title: "Editorial: Bangladesh's digital future needs better data protection", cat: "editorial", country: "Bangladesh", region: "South Asia", type: "opinion", hoursAgo: 35, editor: true, tags: ["editorial", "privacy", "digital"], excerpt: "As Bangladesh goes digital, the new Data Protection Bill must balance innovation with citizens' privacy rights.", body: ["The bill gives the government broad powers over personal data.", "Critics want an independent regulator.", "> \"Privacy is not a luxury; it is the foundation of a free digital society.\""] },
  { title: "Guest Column: Why cricket unites South Asia like nothing else", cat: "guest-column", country: "India", region: "South Asia", type: "opinion", hoursAgo: 41, tags: ["cricket", "opinion", "south-asia"], excerpt: "A former Test cricketer on how the sport transcends borders and politics in the subcontinent.", body: ["Cricket matches between India and Pakistan draw over a billion viewers.", "The sport has softened diplomatic tensions at crucial moments.", "> \"On the field we fight; off it, we share chai.\""] },
  { title: "Investigation: How misinformation networks targeted the 2026 flood coverage", cat: "fact-check", country: "Bangladesh", region: "South Asia", type: "investigation", hoursAgo: 52, fact: "verified", tags: ["misinformation", "factcheck", "investigation"], excerpt: "TrendoraNews traced a coordinated network that spread fake flood footage to 2 million people in 48 hours.", body: ["Old videos from 2017 were recirculated as 'live' flood footage.", "The network used 40 fake Facebook pages.", "## How we verified\n\n- Reverse image search\n- Geolocation of landmarks\n- Metadata analysis"] },
  { title: "Special Report: The garment workers powering Bangladesh's $50bn export industry", cat: "special-reports", country: "Bangladesh", region: "South Asia", type: "feature", hoursAgo: 55, fact: "verified", tags: ["rmg", "workers", "economy"], excerpt: "Inside the factories of Gazipur and Savar where 4 million workers stitch clothes for the world's biggest brands.", body: ["The sector employs 4 million people, 80% of them women.", "Wages have risen 40% in five years.", "Safety standards improved dramatically since 2013.", "> \"Every label in your wardrobe has a story from Dhaka.\""] },
  { title: "Japan's aging population: robots now care for one in five elderly", cat: "asia", country: "Japan", region: "East Asia", type: "feature", hoursAgo: 29, tags: ["japan", "robots", "aging"], excerpt: "With the world's oldest population, Japan is betting on robot caregivers to fill the gap.", body: ["Over 28% of Japanese are over 65.", "Care robots can lift patients and monitor vitals.", "Families report mixed but generally positive results."] },
  { title: "Brazil's Amazon deforestation falls to lowest level in nine years", cat: "nature", country: "Brazil", region: "South America", type: "news", hoursAgo: 31, fact: "verified", tags: ["amazon", "deforestation", "climate"], excerpt: "Satellite data shows a 50% drop in forest clearing compared to last year.", body: ["New enforcement and indigenous land protections helped.", "The government hailed the figures as proof its policies work.", "Environmentalists urge continued vigilance."] },
  { title: "Nigeria's Afrobeats conquers global charts: three #1 singles this month", cat: "music", country: "Nigeria", region: "Africa", type: "news", hoursAgo: 37, tags: ["afrobeats", "music", "nigeria"], excerpt: "Lagos artists now dominate streaming charts from London to Los Angeles.", body: ["Afrobeats streams grew 40% year on year.", "Major labels opened offices in Lagos.", "> \"The world is dancing to Lagos.\""] },
  { title: "Mars rover finds organic molecules in ancient lakebed", cat: "space", country: "United States", region: "North America", type: "news", hoursAgo: 12, fact: "verified", tags: ["mars", "perseverance", "astrobiology"], excerpt: "Perseverance drilled samples containing complex organic compounds in Jezero Crater.", body: ["The molecules are the most complex found on Mars to date.", "They are not proof of life but keep the question open.", "Samples will return to Earth on a future mission."] },
  { title: "China's high-speed rail network passes 45,000 km — the world's longest", cat: "asia", country: "China", region: "East Asia", type: "news", hoursAgo: 17, tags: ["china", "rail", "infrastructure"], excerpt: "China's bullet train network now exceeds the combined high-speed rail of the rest of the world.", body: ["Trains run at up to 350 km/h.", "The network connects every city over 200,000 people.", "Other countries are studying the Chinese model."] },
  { title: "Germany's Energiewende: renewables hit 60% of electricity for the first time", cat: "europe", country: "Germany", region: "Europe", type: "news", hoursAgo: 21, fact: "verified", tags: ["germany", "renewables", "energy"], excerpt: "Wind and solar generated three-fifths of Germany's power in the first half of the year.", body: ["Coal use fell to a record low.", "Industry warns about high power prices.", "The government targets 80% by 2030."] },
  { title: "US election 2026: early polls show tight race in swing states", cat: "americas", country: "United States", region: "North America", type: "news", hoursAgo: 39, fact: "pending", tags: ["uselection", "politics", "usa"], excerpt: "Polls in Pennsylvania, Michigan and Wisconsin show the race within the margin of error.", body: ["Both campaigns are focusing on economic messaging.", "Turnout in early voting is up 12%.", "Debates are scheduled for next month."] },
  { title: "Kenya's marathoners break course record in Berlin", cat: "other-sports", country: "Kenya", region: "Africa", type: "news", hoursAgo: 43, fact: "verified", tags: ["marathon", "kenya", "athletics"], excerpt: "A Kenyan runner clocked 2:01:41, the second-fastest marathon in history.", body: ["The course record fell by 32 seconds.", "Kenyan athletes swept the podium.", "> \"The streets of Berlin belong to Kenya today.\""] },
  { title: "Saudi Arabia unveils $500bn green city project NEOM advances", cat: "middle-east", country: "Saudi Arabia", region: "Middle East", type: "news", hoursAgo: 46, tags: ["neom", "saudi", "megaproject"], excerpt: "The Line — a 170km mirrored megacity — is now 40% complete.", body: ["The project is powered entirely by renewables.", "Critics raise questions about cost and displacement.", "Officials insist completion by 2030 is on track."] },
  { title: "Switzerland opens world's longest rail tunnel extension under the Alps", cat: "europe", country: "Switzerland", region: "Europe", type: "news", hoursAgo: 49, tags: ["switzerland", "tunnel", "rail"], excerpt: "The new 57km Gotthard Base Tunnel route cuts Zurich–Milan travel to under three hours.", body: ["It is the deepest railway tunnel on Earth.", "Construction took 20 years.", "Freight traffic will shift from roads to rail."] },
  { title: "Australia's Great Barrier Reef shows strongest recovery in 36 years", cat: "oceans", country: "Australia", region: "Oceania", type: "news", hoursAgo: 23, fact: "verified", tags: ["reef", "australia", "conservation"], excerpt: "A monitoring report found coral cover at its highest level since records began.", body: ["Recovery was strongest in the northern and central reef.", "Scientists credit cooler sea temperatures and crown-of-thorns control.", "They warn heatwaves remain the biggest threat."] },
  { title: "Canada wildfire season ends with lowest burned area in a decade", cat: "climate", country: "Canada", region: "North America", type: "news", hoursAgo: 47, tags: ["wildfire", "canada", "climate"], excerpt: "Cool, wet weather helped contain fires that burned 'only' 4 million hectares this year.", body: ["Smoke from Canadian fires had blanketed US cities in previous years.", "Officials credit early-season prescribed burns.", "Rebuilding efforts continue in Jasper."] },
  { title: "Vatican opens secret archives from the pontificate of Pius XII", cat: "modern", country: "Italy", region: "Europe", type: "investigation", hoursAgo: 53, fact: "pending", tags: ["vatican", "history", "archives"], excerpt: "Historians will finally access 16,000 files shedding light on the Church during World War II.", body: ["The archives cover 1939–1946.", "Scholars hope to clarify the Vatican's wartime diplomacy.", "Access is by appointment for accredited researchers."] },
  { title: "Film review: Bangladeshi neo-noir 'Monsoon Shadows' stuns at Cannes", cat: "movies", country: "Bangladesh", region: "South Asia", type: "opinion", hoursAgo: 54, editor: true, tags: ["cannes", "film", "bangladesh"], excerpt: "The Dhaka-set thriller earned a standing ovation and a distribution deal worth $2 million.", body: ["Director Raihan Rafi shot the film entirely on location in Old Dhaka.", "Critics praised its atmospheric monsoon cinematography.", "> \"Bangladesh cinema has arrived on the world stage.\""] },
  { title: "Celebrity couple announces engagement at Dhaka charity gala", cat: "celebrity", country: "Bangladesh", region: "South Asia", type: "news", hoursAgo: 56, tags: ["celebrity", "dhaka", "gala"], excerpt: "The announcement dominated social media within minutes, with 2 million likes in an hour.", body: ["The gala raised $3 million for flood relief.", "Fans flooded congratulatory messages.", "The wedding is planned for winter 2027."] },
  { title: "Physics Nobel awarded for attosecond laser pulses", cat: "physics", country: "Sweden", region: "Europe", type: "news", hoursAgo: 58, fact: "verified", tags: ["nobel", "physics", "laser"], excerpt: "Three scientists were honoured for tools that let us watch electrons move in atoms.", body: ["Attosecond pulses are a billionth of a billionth of a second.", "The research opens the field of 'attochemistry'.", "> \"We can now see the invisible dance of electrons.\""] },
  { title: "AI tutors enter South Asian classrooms — do they help?", cat: "ai", country: "India", region: "South Asia", type: "investigation", hoursAgo: 60, fact: "verified", tags: ["ai", "education", "india"], excerpt: "A six-month TrendoraNews study in 40 schools found mixed but promising results for AI tutoring apps.", body: ["Students using AI tutors improved math scores by 18% on average.", "Teachers worried about over-dependence.", "## Study design\n\n- 40 schools, 4,000 students\n- Randomized rollout\n- Pre/post standardized tests"] },
];

const BREAKING = [
  {
    title: "Severe flooding displaces thousands in Sylhet and Sunamganj districts",
    summary: "Flash floods from upstream hill torrents have inundated 12 upazilas. Rescue operations are underway with army and fire service teams deployed.",
    content: "Relief camps are being set up in schools and madrasas. The district administration has declared a state of emergency in the worst-hit areas.",
    status: "live", severity: "critical", country: "Bangladesh",
    updates: [
      "Flood water entered Sylhet city's low-lying areas; 200 families evacuated to shelters.",
      "Army deployed to Sunamganj; 14 rescue boats operating overnight.",
      "Water levels rising in Surma river — authorities warn of further inundation in next 24 hours.",
      "Government announces Tk 50 crore emergency relief fund for flood victims.",
    ],
  },
  {
    title: "Dhaka stock market halts trading after 7% circuit breaker triggered",
    summary: "The DSEX index plunged 7% within the first hour of trading, triggering an automatic halt. Analysts cite global tech sell-off and local political uncertainty.",
    status: "developing", severity: "high", country: "Bangladesh",
    updates: [
      "Circuit breaker triggered at 10:15 AM after index fell 520 points.",
      "Banking and telecom stocks led the decline.",
      "Regulators monitoring situation; trading to resume after review.",
    ],
  },
  {
    title: "Major earthquake strikes southeastern Turkey; tremors felt across region",
    summary: "A magnitude 6.4 earthquake hit Kahramanmaras province. Early reports indicate building damage; rescue teams on high alert.",
    status: "resolved", severity: "critical", country: "Turkey",
    updates: [
      "Initial magnitude reported at 6.4; epicentre 20km deep.",
      "AFAD confirms search and rescue teams deployed to 8 districts.",
      "Situation brought under control; aftershocks continuing but weakening.",
    ],
  },
];

const COUNTRY_DATA: { name: string; code: string; region: string; capital: string; population: string; currency: string; languages: string; summary: string; x: number; y: number }[] = [
  { name: "Bangladesh", code: "BD", region: "South Asia", capital: "Dhaka", population: "172 million", currency: "Taka (BDT)", languages: "Bengali", summary: "Riverine delta nation in South Asia, known for the Sundarbans, rich textile industry and vibrant culture.", x: 655, y: 235 },
  { name: "India", code: "IN", region: "South Asia", capital: "New Delhi", population: "1.43 billion", currency: "Rupee (INR)", languages: "Hindi, English + 20 official", summary: "World's most populous democracy and a global tech and space power.", x: 640, y: 245 },
  { name: "Pakistan", code: "PK", region: "South Asia", capital: "Islamabad", population: "240 million", currency: "Rupee (PKR)", languages: "Urdu, English", summary: "Nuclear-armed South Asian nation with a young population and strategic location.", x: 610, y: 225 },
  { name: "Nepal", code: "NP", region: "South Asia", capital: "Kathmandu", population: "30 million", currency: "Rupee (NPR)", languages: "Nepali", summary: "Himalayan nation home to eight of the world's ten highest peaks, including Everest.", x: 648, y: 222 },
  { name: "Bhutan", code: "BT", region: "South Asia", capital: "Thimphu", population: "780,000", currency: "Ngultrum (BTN)", languages: "Dzongkha", summary: "Carbon-negative Himalayan kingdom that measures Gross National Happiness.", x: 668, y: 222 },
  { name: "Sri Lanka", code: "LK", region: "South Asia", capital: "Sri Jayawardenepura Kotte", population: "22 million", currency: "Rupee (LKR)", languages: "Sinhala, Tamil", summary: "Teardrop of the Indian Ocean, famous for tea, temples and beaches.", x: 665, y: 275 },
  { name: "Myanmar", code: "MM", region: "Southeast Asia", capital: "Naypyidaw", population: "55 million", currency: "Kyat (MMK)", languages: "Burmese", summary: "Southeast Asian nation rich in jade, rubies and Buddhist heritage.", x: 710, y: 245 },
  { name: "China", code: "CN", region: "East Asia", capital: "Beijing", population: "1.41 billion", currency: "Yuan (CNY)", languages: "Mandarin Chinese", summary: "World's second-largest economy and manufacturing powerhouse.", x: 740, y: 190 },
  { name: "Japan", code: "JP", region: "East Asia", capital: "Tokyo", population: "125 million", currency: "Yen (JPY)", languages: "Japanese", summary: "Island tech superpower blending ancient tradition with cutting-edge innovation.", x: 860, y: 185 },
  { name: "South Korea", code: "KR", region: "East Asia", capital: "Seoul", population: "51 million", currency: "Won (KRW)", languages: "Korean", summary: "Global leader in semiconductors, K-culture, shipbuilding and pop music.", x: 825, y: 195 },
  { name: "United States", code: "US", region: "North America", capital: "Washington, D.C.", population: "335 million", currency: "Dollar (USD)", languages: "English", summary: "World's largest economy and a global leader in tech, finance and entertainment.", x: 180, y: 175 },
  { name: "United Kingdom", code: "GB", region: "Europe", capital: "London", population: "68 million", currency: "Pound (GBP)", languages: "English", summary: "Historic island nation with a global financial centre in London.", x: 465, y: 105 },
  { name: "Germany", code: "DE", region: "Europe", capital: "Berlin", population: "84 million", currency: "Euro (EUR)", languages: "German", summary: "Europe's largest economy, engineering powerhouse and EU leader.", x: 495, y: 110 },
  { name: "France", code: "FR", region: "Europe", capital: "Paris", population: "68 million", currency: "Euro (EUR)", languages: "French", summary: "Cultural capital of the world — cuisine, fashion, art and diplomacy.", x: 480, y: 120 },
  { name: "Russia", code: "RU", region: "Europe", capital: "Moscow", population: "144 million", currency: "Ruble (RUB)", languages: "Russian", summary: "Largest country on Earth, spanning Europe and Asia with vast resources.", x: 700, y: 90 },
  { name: "Ukraine", code: "UA", region: "Europe", capital: "Kyiv", population: "36 million", currency: "Hryvnia (UAH)", languages: "Ukrainian", summary: "Brave Eastern European nation defending its sovereignty; Europe's breadbasket.", x: 545, y: 115 },
  { name: "Saudi Arabia", code: "SA", region: "Middle East", capital: "Riyadh", population: "36 million", currency: "Riyal (SAR)", languages: "Arabic", summary: "Custodian of Islam's two holiest cities and the world's top oil exporter.", x: 575, y: 245 },
  { name: "UAE", code: "AE", region: "Middle East", capital: "Abu Dhabi", population: "10 million", currency: "Dirham (AED)", languages: "Arabic", summary: "Gulf federation of futuristic cities, finance and global aviation hubs.", x: 600, y: 250 },
  { name: "Qatar", code: "QA", region: "Middle East", capital: "Doha", population: "2.7 million", currency: "Riyal (QAR)", languages: "Arabic", summary: "Tiny Gulf state with the world's third-largest gas reserves and a 2022 World Cup legacy.", x: 590, y: 242 },
  { name: "Turkey", code: "TR", region: "Middle East", capital: "Ankara", population: "85 million", currency: "Lira (TRY)", languages: "Turkish", summary: "Bridge between Europe and Asia on the Bosphorus, with a rich Ottoman heritage.", x: 545, y: 140 },
  { name: "Iran", code: "IR", region: "Middle East", capital: "Tehran", population: "87 million", currency: "Rial (IRR)", languages: "Persian", summary: "Ancient Persian civilization with a young, educated population.", x: 590, y: 205 },
  { name: "Iraq", code: "IQ", region: "Middle East", capital: "Baghdad", population: "45 million", currency: "Dinar (IQD)", languages: "Arabic, Kurdish", summary: "Cradle of civilization between the Tigris and Euphrates rivers.", x: 565, y: 210 },
  { name: "Israel", code: "IL", region: "Middle East", capital: "Jerusalem", population: "9.8 million", currency: "Shekel (ILS)", languages: "Hebrew", summary: "Startup nation and holy land at the crossroads of three continents.", x: 560, y: 225 },
  { name: "Palestine", code: "PS", region: "Middle East", capital: "East Jerusalem (claimed)", population: "5.3 million", currency: "Shekel (ILS)", languages: "Arabic", summary: "Historic land at the heart of the Israeli–Palestinian conflict.", x: 558, y: 222 },
  { name: "Egypt", code: "EG", region: "Africa", capital: "Cairo", population: "112 million", currency: "Pound (EGP)", languages: "Arabic", summary: "Land of the pyramids on the Nile, gateway between Africa and the Middle East.", x: 545, y: 235 },
  { name: "Nigeria", code: "NG", region: "Africa", capital: "Abuja", population: "223 million", currency: "Naira (NGN)", languages: "English + 500 local", summary: "Africa's most populous country, Nollywood and Afrobeats powerhouse.", x: 490, y: 290 },
  { name: "South Africa", code: "ZA", region: "Africa", capital: "Pretoria", population: "60 million", currency: "Rand (ZAR)", languages: "11 official languages", summary: "Rainbow nation with three capital cities and a history of reconciliation.", x: 520, y: 380 },
  { name: "Kenya", code: "KE", region: "Africa", capital: "Nairobi", population: "55 million", currency: "Shilling (KES)", languages: "Swahili, English", summary: "East African safari and marathon capital, a regional tech hub.", x: 555, y: 310 },
  { name: "Brazil", code: "BR", region: "South America", capital: "Brasília", population: "216 million", currency: "Real (BRL)", languages: "Portuguese", summary: "Largest South American nation, home to the Amazon and five-time football champions.", x: 290, y: 330 },
  { name: "Argentina", code: "AR", region: "South America", capital: "Buenos Aires", population: "46 million", currency: "Peso (ARS)", languages: "Spanish", summary: "Tango, football (Messi's homeland) and the pampas.", x: 270, y: 410 },
  { name: "Australia", code: "AU", region: "Oceania", capital: "Canberra", population: "26 million", currency: "Dollar (AUD)", languages: "English", summary: "Island continent famous for the Great Barrier Reef, unique wildlife and sports.", x: 855, y: 355 },
  { name: "Canada", code: "CA", region: "North America", capital: "Ottawa", population: "40 million", currency: "Dollar (CAD)", languages: "English, French", summary: "Second-largest country, known for maple syrup, politeness and vast wilderness.", x: 170, y: 110 },
  { name: "Italy", code: "IT", region: "Europe", capital: "Rome", population: "59 million", currency: "Euro (EUR)", languages: "Italian", summary: "Boot-shaped peninsula of Renaissance art, cuisine and ancient Rome.", x: 500, y: 135 },
  { name: "Spain", code: "ES", region: "Europe", capital: "Madrid", population: "48 million", currency: "Euro (EUR)", languages: "Spanish", summary: "Land of tapas, siestas, La Liga and sun-drenched Mediterranean coasts.", x: 465, y: 135 },
  { name: "Netherlands", code: "NL", region: "Europe", capital: "Amsterdam", population: "18 million", currency: "Euro (EUR)", languages: "Dutch", summary: "Low-lying cycling nation of windmills, tulips and global trade.", x: 490, y: 100 },
  { name: "Switzerland", code: "CH", region: "Europe", capital: "Bern", population: "8.8 million", currency: "Franc (CHF)", languages: "German, French, Italian, Romansh", summary: "Alpine nation famous for watches, chocolate, cheese and neutrality.", x: 495, y: 120 },
  { name: "Sweden", code: "SE", region: "Europe", capital: "Stockholm", population: "10.5 million", currency: "Krona (SEK)", languages: "Swedish", summary: "Nordic innovator of Nobel Prizes, IKEA, Spotify and Volvo.", x: 510, y: 80 },
  { name: "Norway", code: "NO", region: "Europe", capital: "Oslo", population: "5.5 million", currency: "Krone (NOK)", languages: "Norwegian", summary: "Fjord-rich kingdom with the world's largest sovereign wealth fund and EV adoption.", x: 505, y: 70 },
  { name: "Thailand", code: "TH", region: "Southeast Asia", capital: "Bangkok", population: "71 million", currency: "Baht (THB)", languages: "Thai", summary: "Land of smiles — temples, street food and tropical beaches.", x: 745, y: 260 },
  { name: "Vietnam", code: "VN", region: "Southeast Asia", capital: "Hanoi", population: "100 million", currency: "Dong (VND)", languages: "Vietnamese", summary: "Rising manufacturing star with a thousand-year history and famous cuisine.", x: 770, y: 255 },
  { name: "Indonesia", code: "ID", region: "Southeast Asia", capital: "Jakarta", population: "279 million", currency: "Rupiah (IDR)", languages: "Indonesian", summary: "World's largest archipelago — 17,000 islands between Asia and Australia.", x: 790, y: 290 },
  { name: "Malaysia", code: "MY", region: "Southeast Asia", capital: "Kuala Lumpur", population: "34 million", currency: "Ringgit (MYR)", languages: "Malay", summary: "Multicultural federation famous for the Petronas Towers and rainforests.", x: 760, y: 285 },
  { name: "Singapore", code: "SG", region: "Southeast Asia", capital: "Singapore", population: "6 million", currency: "Dollar (SGD)", languages: "English, Mandarin, Malay, Tamil", summary: "City-state global financial hub and one of the cleanest cities on Earth.", x: 755, y: 295 },
  { name: "Philippines", code: "PH", region: "Southeast Asia", capital: "Manila", population: "117 million", currency: "Peso (PHP)", languages: "Filipino, English", summary: "7,600-island archipelago known for hospitality and resilience.", x: 810, y: 260 },
];

const ANIMALS = [
  { name: "Royal Bengal Tiger", scientific: "Panthera tigris tigris", habitat: "Sundarbans mangroves, Bangladesh/India", diet: "Carnivore — deer, wild boar", conservation: "Endangered", lifespan: "15–20 years", facts: "The Sundarbans hosts the world's largest population of Bengal tigers. They are the only big cats that swim regularly.", emoji: "🐅" },
  { name: "Asian Elephant", scientific: "Elephas maximus", habitat: "Forests of South & Southeast Asia", diet: "Herbivore — grasses, leaves, bark", conservation: "Endangered", lifespan: "60–70 years", facts: "Elephants mourn their dead and communicate through infrasound over kilometres.", emoji: "🐘" },
  { name: "Blue Whale", scientific: "Balaenoptera musculus", habitat: "All oceans, incl. Bay of Bengal", diet: "Carnivore — krill", conservation: "Endangered", lifespan: "80–90 years", facts: "The largest animal ever known — its heart alone is the size of a small car; its tongue weighs as much as an elephant.", emoji: "🐋" },
  { name: "Common Bottlenose Dolphin", scientific: "Tursiops truncatus", habitat: "Warm & temperate seas", diet: "Carnivore — fish, squid", conservation: "Least Concern", lifespan: "40–60 years", facts: "Dolphins call each other by name using signature whistles.", emoji: "🐬" },
  { name: "Domestic Dog", scientific: "Canis lupus familiaris", habitat: "Worldwide, with humans", diet: "Omnivore", conservation: "Least Concern", lifespan: "10–14 years", facts: "Dogs have co-evolved with humans for over 15,000 years and can read our facial expressions better than chimpanzees.", emoji: "🐕" },
  { name: "Domestic Cat", scientific: "Felis catus", habitat: "Worldwide, with humans", diet: "Carnivore — small prey", conservation: "Least Concern", lifespan: "12–18 years", facts: "Cats purr at a frequency (25–150 Hz) that may promote bone healing.", emoji: "🐈" },
  { name: "African Lion", scientific: "Panthera leo", habitat: "Sub-Saharan savannas", diet: "Carnivore — wildebeest, zebra", conservation: "Vulnerable", lifespan: "10–14 years (wild)", facts: "Lions are the only truly social cats, living in prides. A lion's roar can be heard 8 km away.", emoji: "🦁" },
  { name: "Giant Panda", scientific: "Ailuropoda melanoleuca", habitat: "Bamboo forests, central China", diet: "Herbivore — bamboo (99%)", conservation: "Vulnerable", lifespan: "20 years", facts: "Pandas spend 10–16 hours a day eating bamboo and have a 'pseudo-thumb' for gripping stalks.", emoji: "🐼" },
  { name: "Kangaroo", scientific: "Macropus spp.", habitat: "Australian grasslands", diet: "Herbivore — grasses", conservation: "Least Concern", lifespan: "6–20 years", facts: "Kangaroos cannot walk backwards — which is why they're on Australia's coat of arms.", emoji: "🦘" },
  { name: "Emperor Penguin", scientific: "Aptenodytes forsteri", habitat: "Antarctic ice", diet: "Carnivore — fish, krill", conservation: "Near Threatened", lifespan: "15–20 years", facts: "Males incubate the single egg on their feet for 64 days without eating, in −60°C blizzards.", emoji: "🐧" },
  { name: "Bald Eagle", scientific: "Haliaeetus leucocephalus", habitat: "North America, near water", diet: "Carnivore — fish", conservation: "Least Concern", lifespan: "20–30 years", facts: "The US national bird can dive at 160 km/h and spots prey from 3 km away.", emoji: "🦅" },
  { name: "Great White Shark", scientific: "Carcharodon carcharias", habitat: "Coastal oceans worldwide", diet: "Carnivore — seals, fish", conservation: "Vulnerable", lifespan: "70+ years", facts: "Sharks existed before trees — over 400 million years ago. They can detect one drop of blood in a million drops of water.", emoji: "🦈" },
  { name: "Gray Wolf", scientific: "Canis lupus", habitat: "Forests & tundra, northern hemisphere", diet: "Carnivore — large ungulates", conservation: "Least Concern", lifespan: "6–8 years (wild)", facts: "Wolf packs are family units led by the parents; the famous 'alpha wolf' myth came from captive wolves.", emoji: "🐺" },
  { name: "Red Fox", scientific: "Vulpes vulpes", habitat: "Forests, cities, worldwide", diet: "Omnivore", conservation: "Least Concern", lifespan: "3–5 years (wild)", facts: "Foxes use Earth's magnetic field to aim their pounce — they hunt best facing north.", emoji: "🦊" },
  { name: "Giraffe", scientific: "Giraffa camelopardalis", habitat: "African savannas", diet: "Herbivore — acacia leaves", conservation: "Vulnerable", lifespan: "20–25 years", facts: "A giraffe's neck has the same number of vertebrae as a human's — seven — but each can be 25 cm long.", emoji: "🦒" },
  { name: "Plains Zebra", scientific: "Equus quagga", habitat: "Eastern & southern Africa", diet: "Herbivore — grasses", conservation: "Near Threatened", lifespan: "20–30 years", facts: "Every zebra has a unique stripe pattern, like a human fingerprint.", emoji: "🦓" },
  { name: "Indian Rhinoceros", scientific: "Rhinoceros unicornis", habitat: "Grasslands of Nepal & Assam", diet: "Herbivore — grasses", conservation: "Vulnerable", lifespan: "40–50 years", facts: "Thanks to conservation, rhinos rose from ~200 in 1900 to over 4,000 today. They have prehensile lips for grazing.", emoji: "🦏" },
  { name: "Hippopotamus", scientific: "Hippopotamus amphibius", habitat: "Rivers & lakes of sub-Saharan Africa", diet: "Herbivore — grass", conservation: "Vulnerable", lifespan: "40–50 years", facts: "Hippos secrete a red 'sweat' that acts as sunscreen and antibiotic. They kill more people in Africa than any other large animal.", emoji: "🦛" },
  { name: "Saltwater Crocodile", scientific: "Crocodylus porosus", habitat: "Rivers & coasts, South Asia to Australia", diet: "Carnivore — anything it can catch", conservation: "Least Concern", lifespan: "70+ years", facts: "The largest living reptile — males reach 6+ metres and have the strongest bite of any animal (16,000 newtons).", emoji: "🐊" },
  { name: "Snow Leopard", scientific: "Panthera uncia", habitat: "Himalayan & Central Asian mountains", diet: "Carnivore — blue sheep, ibex", conservation: "Vulnerable", lifespan: "15–18 years", facts: "Known as the 'ghost of the mountains', fewer than 7,000 remain. Its long tail helps it balance on cliffs.", emoji: "🐆" },
  { name: "Hilsa Fish", scientific: "Tenualosa ilisha", habitat: "Rivers & Bay of Bengal, Bangladesh/India/Myanmar", diet: "Planktivore", conservation: "Least Concern", facts: "Bangladesh's national fish — 80% of the world's hilsa comes from Bangladeshi waters, and it cannot be farmed, only caught wild.", emoji: "🐟" },
  { name: "Giant Pacific Octopus", scientific: "Enteroctopus dofleini", habitat: "North Pacific Ocean", diet: "Carnivore — crabs, shellfish", conservation: "Least Concern", lifespan: "3–5 years", facts: "Octopuses have three hearts, blue blood and nine brains — one in the head, one in each arm.", emoji: "🐙" },
  { name: "Horse", scientific: "Equus ferus caballus", habitat: "Domesticated worldwide", diet: "Herbivore — grass, hay", conservation: "Least Concern", lifespan: "25–30 years", facts: "Horses sleep standing up using a 'stay apparatus' in their legs, and can run within hours of birth.", emoji: "🐴" },
  { name: "Camel", scientific: "Camelus dromedarius / bactrianus", habitat: "Deserts of Africa, Middle East, Central Asia", diet: "Herbivore — dry grasses, thorns", conservation: "Least Concern (domestic)", lifespan: "40–50 years", facts: "Camels can drink 100 litres of water in three minutes and close their nostrils during sandstorms.", emoji: "🐫" },
  { name: "Polar Bear", scientific: "Ursus maritimus", habitat: "Arctic sea ice", diet: "Carnivore — seals", conservation: "Vulnerable", lifespan: "25–30 years", facts: "The largest land carnivore; its fur is actually transparent and its skin is black to absorb heat.", emoji: "🐻‍❄️" },
  { name: "Tawny Owl", scientific: "Strix aluco", habitat: "Woodlands & cities, Europe & Asia", diet: "Carnivore — small mammals, insects", conservation: "Least Concern", lifespan: "15 years (wild)", facts: "The classic 'twit-twoo' call is actually a duet — the female's 'ke-wick' answered by the male's hoot.", emoji: "🦉" },
];

const SPACE = [
  { name: "Sun", type: "star", distance: "149.6 million km (1 AU)", diameter: "1.39 million km", description: "The star at the centre of our solar system, holding 99.86% of its mass.", facts: "Core temperature: 15 million °C. Light takes 8 minutes 20 seconds to reach Earth.", emoji: "☀️" },
  { name: "Mercury", type: "planet", distance: "57.9 million km from Sun", diameter: "4,879 km", description: "The smallest planet and the closest to the Sun, with extreme temperature swings.", facts: "A day on Mercury (sunrise to sunrise) lasts 176 Earth days.", emoji: "☿" },
  { name: "Venus", type: "planet", distance: "108.2 million km from Sun", diameter: "12,104 km", description: "Earth's 'evil twin' — similar size but a runaway greenhouse effect makes it the hottest planet.", facts: "Surface temperature: 465 °C. It rains sulfuric acid. A day is longer than its year.", emoji: "♀" },
  { name: "Earth", type: "planet", distance: "149.6 million km from Sun", diameter: "12,742 km", description: "The only known planet with life — 71% covered by oceans, protected by a magnetic field.", facts: "Earth is the densest planet in the solar system. It travels around the Sun at 107,000 km/h.", emoji: "🌍" },
  { name: "Mars", type: "planet", distance: "227.9 million km from Sun", diameter: "6,779 km", description: "The red planet — home to Olympus Mons (the tallest volcano) and Valles Marineris.", facts: "Mars has the largest dust storms in the solar system and water ice at its poles. Perseverance rover is exploring it now.", emoji: "♂" },
  { name: "Jupiter", type: "planet", distance: "778.5 million km from Sun", diameter: "139,820 km", description: "The gas giant — more massive than all other planets combined. Its Great Red Spot is a storm bigger than Earth.", facts: "Jupiter has at least 95 moons. Its moon Europa may hide a subsurface ocean.", emoji: "♃" },
  { name: "Saturn", type: "planet", distance: "1.43 billion km from Sun", diameter: "116,460 km", description: "Famous for its spectacular ring system made of ice and rock particles.", facts: "Saturn is less dense than water — it would float in a giant bathtub. Its moon Titan has lakes of liquid methane.", emoji: "♄" },
  { name: "Uranus", type: "planet", distance: "2.87 billion km from Sun", diameter: "50,724 km", description: "An ice giant that rotates on its side, with faint rings and 27 known moons.", facts: "Uranus is the coldest planetary atmosphere in the solar system (−224 °C).", emoji: "♅" },
  { name: "Neptune", type: "planet", distance: "4.5 billion km from Sun", diameter: "49,244 km", description: "The windiest planet — winds reach 2,100 km/h. Deep blue from methane in its atmosphere.", facts: "A Neptune year lasts 165 Earth years. It was discovered by math before telescopes.", emoji: "♆" },
  { name: "Moon", type: "planet", distance: "384,400 km from Earth", diameter: "3,474 km", description: "Earth's only natural satellite, stabilizing our planet's tilt and causing tides.", facts: "The Moon is drifting 3.8 cm away from Earth every year. Artemis astronauts will return there this decade.", emoji: "🌙" },
  { name: "Milky Way", type: "galaxy", distance: "We are inside it", diameter: "105,700 light-years", description: "Our spiral galaxy containing 100–400 billion stars, including the Sun.", facts: "The Milky Way and Andromeda will collide in about 4.5 billion years.", emoji: "🌌" },
  { name: "Andromeda Galaxy", type: "galaxy", distance: "2.5 million light-years", diameter: "220,000 light-years", description: "The nearest large galaxy to the Milky Way, visible to the naked eye on dark nights.", facts: "Andromeda contains about 1 trillion stars — twice the Milky Way.", emoji: "🌀" },
  { name: "International Space Station", type: "mission", distance: "400 km above Earth", diameter: "109 m across", description: "The habitable artificial satellite orbiting Earth every 90 minutes, hosting international crews since 2000.", facts: "Astronauts see 16 sunrises and sunsets every day aboard the ISS.", emoji: "🛰️" },
  { name: "James Webb Space Telescope", type: "mission", distance: "1.5 million km from Earth (L2)", diameter: "6.5 m mirror", description: "The most powerful space telescope ever built, observing the universe in infrared.", facts: "JWST has seen galaxies just 300 million years after the Big Bang.", emoji: "🔭" },
  { name: "Artemis Program", type: "mission", distance: "Moon & beyond", diameter: "—", description: "NASA's program to return humans to the Moon and establish a sustainable presence, as a stepping stone to Mars.", facts: "Artemis III aims to land the first woman and first person of colour on the Moon.", emoji: "🚀" },
  { name: "Voyager 1", type: "mission", distance: "24+ billion km from Earth", diameter: "—", description: "The farthest human-made object, launched in 1977, now in interstellar space carrying the Golden Record.", facts: "Voyager 1 travels at 61,000 km/h and still sends data back after nearly 50 years.", emoji: "🛸" },
];

const TIMELINE = [
  { year: -3200, title: "Invention of writing in Mesopotamia", description: "The Sumerians develop cuneiform, the world's first writing system, on clay tablets — history begins.", category: "Ancient", country: "Iraq", emoji: "🪶" },
  { year: -2560, title: "Great Pyramid of Giza completed", description: "The tomb of Pharaoh Khufu becomes the tallest human-made structure for 3,800 years.", category: "Ancient", country: "Egypt", emoji: "🔺" },
  { year: -776, title: "First Olympic Games in Olympia", description: "Athletic games held in honour of Zeus mark the start of the Olympic tradition.", category: "Ancient", country: "Greece", emoji: "🏛️" },
  { year: -221, title: "Qin Shi Huang unifies China", description: "The first Emperor of China standardizes writing, currency, weights and builds the early Great Wall.", category: "Ancient", country: "China", emoji: "🏯" },
  { year: 1206, title: "Genghis Khan founds the Mongol Empire", description: "The largest contiguous land empire in history begins under Temüjin, Genghis Khan.", category: "Medieval", country: "Mongolia", emoji: "🐎" },
  { year: 1347, title: "Black Death reaches Europe", description: "The bubonic plague kills an estimated 30–60% of Europe's population, reshaping society and labour.", category: "Medieval", country: "Italy", emoji: "⚰️" },
  { year: 1453, title: "Fall of Constantinople", description: "Ottoman forces under Mehmed II capture Constantinople, ending the Byzantine Empire after 1,100 years.", category: "Medieval", country: "Turkey", emoji: "🕌" },
  { year: 1492, title: "Columbus reaches the Americas", description: "Christopher Columbus's voyage opens sustained contact between Europe and the Americas.", category: "Modern", country: "Spain", emoji: "⛵" },
  { year: 1687, title: "Newton publishes Principia", description: "Isaac Newton's laws of motion and universal gravitation lay the foundation of classical physics.", category: "Modern", country: "England", emoji: "🍎" },
  { year: 1776, title: "American Declaration of Independence", description: "Thirteen colonies declare independence from Britain, founding the United States of America.", category: "Modern", country: "United States", emoji: "🦅" },
  { year: 1789, title: "French Revolution begins", description: "The storming of the Bastille sparks a revolution that reshapes France and inspires the world.", category: "Modern", country: "France", emoji: "🇫🇷" },
  { year: 1859, title: "Darwin publishes On the Origin of Species", description: "Charles Darwin's theory of evolution by natural selection transforms biology.", category: "Modern", country: "England", emoji: "🐢" },
  { year: 1905, title: "Einstein's Annus Mirabilis", description: "Einstein publishes special relativity, the photoelectric effect and Brownian motion papers in one year.", category: "Modern", country: "Germany", emoji: "⚛️" },
  { year: 1915, title: "General Relativity proposed", description: "Einstein redefines gravity as the curvature of spacetime — confirmed by the 1919 eclipse.", category: "Modern", country: "Germany", emoji: "🌑" },
  { year: 1947, title: "India & Pakistan gain independence", description: "British India is partitioned; India and Pakistan become independent nations on 15 and 14 August 1947.", category: "Modern", country: "India", emoji: "🇮🇳" },
  { year: 1952, title: "DNA double helix discovered", description: "Watson, Crick, Franklin and Wilkins reveal the structure of DNA, unlocking the code of life.", category: "Modern", country: "England", emoji: "🧬" },
  { year: 1969, title: "Apollo 11 Moon landing", description: "Neil Armstrong and Buzz Aldrin walk on the Moon — 'one giant leap for mankind.'", category: "Modern", country: "United States", emoji: "🌕" },
  { year: 1971, title: "Bangladesh Liberation War", description: "After a nine-month war, Bangladesh is born as an independent nation on 16 December 1971.", category: "Modern", country: "Bangladesh", emoji: "🇧🇩" },
  { year: 1989, title: "Fall of the Berlin Wall", description: "The wall dividing East and West Berlin falls, symbolizing the end of the Cold War.", category: "Modern", country: "Germany", emoji: "🧱" },
  { year: 1991, title: "World Wide Web goes public", description: "Tim Berners-Lee releases the web, transforming how humanity shares information.", category: "Modern", country: "Switzerland", emoji: "🌐" },
  { year: 2020, title: "COVID-19 pandemic declared", description: "WHO declares a pandemic; vaccines developed in record time reshape global health.", category: "Modern", country: "Global", emoji: "🦠" },
  { year: 2026, title: "TrendoraNews launches its Interactive Explorers", description: "A new era of interactive journalism: world maps, timelines, encyclopedias and live fact-checking.", category: "Modern", country: "Bangladesh", emoji: "🚀" },
];

const EXPLAINERS = [
  { slug: "how-the-internet-works", title: "How the Internet Actually Works", category: "Technology", difficulty: "easy", summary: "From your phone to a server on the other side of the world in milliseconds — explained simply.", content: "When you open a webpage, your phone sends a request through Wi-Fi or mobile data to a router, which forwards it through undersea fibre-optic cables to a server.\n\n## The journey\n\n- Your request is chopped into small 'packets'\n- Packets travel via the fastest available route\n- The server sends the webpage back the same way\n- Your browser reassembles the packets and draws the page\n\nDNS acts like the internet's phonebook, translating names like trendora.news into numeric IP addresses." },
  { slug: "climate-change-in-60-seconds", title: "Climate Change in 60 Seconds", category: "Environment", difficulty: "easy", summary: "What the greenhouse effect is, and why 1.5°C matters.", content: "Burning coal, oil and gas releases CO₂, which traps heat in the atmosphere — the greenhouse effect.\n\nEarth has warmed about 1.2°C since pre-industrial times. Scientists warn that passing 1.5°C brings far worse floods, droughts and heatwaves.\n\n## What helps\n\n- Renewable energy (solar, wind)\n- Electric transport\n- Protecting forests like the Sundarbans\n- Eating less meat" },
  { slug: "how-vaccines-work", title: "How Vaccines Train Your Immune System", category: "Health", difficulty: "easy", summary: "Vaccines are practice sessions for your body's defences.", content: "A vaccine contains a harmless piece of a germ (or instructions to make one). Your immune system practises fighting it and remembers how.\n\nIf the real germ ever invades, your body destroys it before you get sick.\n\n## Key terms\n\n- Antibodies: proteins that lock onto germs\n- Memory cells: the immune system's 'notes'\n- mRNA vaccines: deliver instructions, like a recipe card" },
  { slug: "stock-market-basics", title: "The Stock Market, Explained for Beginners", category: "Business", difficulty: "medium", summary: "What a share is, why prices move, and what an index like the DSEX measures.", content: "A share is a small ownership piece of a company. When you buy one, you bet the company will grow.\n\nPrices move on supply and demand — if more people want to buy than sell, the price rises.\n\nAn index like Bangladesh's DSEX tracks many big companies together, giving a snapshot of the whole market.\n\n## Remember\n\n- Diversify: don't put everything in one company\n- Time in the market beats timing the market\n- Never invest money you'll need soon" },
  { slug: "why-the-sky-is-blue", title: "Why Is the Sky Blue?", category: "Science", difficulty: "easy", summary: "Sunlight, air molecules and a phenomenon called Rayleigh scattering.", content: "Sunlight looks white but contains all colours. When it enters the atmosphere, air molecules scatter the shorter blue wavelengths in every direction — so blue appears to come from everywhere in the sky.\n\nAt sunrise and sunset, light travels through more air, scattering blue away and leaving reds and oranges." },
  { slug: "bangladesh-rivers-economy", title: "Why Bangladesh's Rivers Run Its Economy", category: "Geography", difficulty: "medium", summary: "The Padma, Meghna and Brahmaputra delta — fertile land, trade routes and fisheries.", content: "Bangladesh sits on the world's largest river delta. The Padma, Meghna, Jamuna and their tributaries deposit rich silt, making the land extraordinarily fertile for rice and jute.\n\nRivers are also highways: cargo boats move goods cheaply, and hilsa fishing employs millions.\n\nBut the same rivers bring floods and erosion — managing them is the country's greatest challenge." },
];

const FACTCHECKS = [
  { claim: "A video shows 'live' flooding in Dhaka's streets in 2026.", verdict: "false", explanation: "Reverse image search shows the footage is from the 2017 Rampura floods. Geolocation of shop signs confirms the location and year mismatch." },
  { claim: "Bangladesh's remittances hit a record $3 billion in one month.", verdict: "misleading", explanation: "The record month saw $2.1 billion. $3 billion was the quarterly figure — the claim mixed monthly and quarterly data." },
  { claim: "The Padma Bridge is the longest bridge in South Asia.", verdict: "false", explanation: "At 6.15 km it is the longest bridge in Bangladesh, but the 21 km Bhupen Hazarika Setu (India) and the 9.8 km Bangabandhu Bridge rail span aside, longer bridges exist in the region." },
  { claim: "Drinking warm water cures COVID-19.", verdict: "false", explanation: "No scientific evidence supports this. Warm water soothes a sore throat but does not kill the coronavirus. Vaccination remains the proven protection." },
  { claim: "Bangladesh is among the top 5 most climate-vulnerable countries in the world.", verdict: "true", explanation: "The Climate Risk Index and IPCC reports consistently rank Bangladesh among the most vulnerable due to its low-lying delta geography and cyclone exposure." },
  { claim: "AI has already replaced journalists at major newspapers.", verdict: "unproven", explanation: "AI assists with drafts and translations, but major newsrooms still rely on human journalists for reporting and verification. No major outlet is fully AI-staffed." },
];

const TAG_POOL = ["bangladesh", "world", "politics", "economy", "cricket", "football", "ai", "space", "climate", "health", "education", "technology", "history", "animals", "travel", "fashion", "markets", "science", "culture", "investigation", "live", "sports", "startup", "election", "flood"];

function contentOf(a: A): string {
  const paras = a.body ?? [
    a.excerpt,
    `Sources close to the developments said the story is still unfolding, and TrendoraNews reporters are monitoring the situation closely. Officials are expected to issue a statement later today.`,
    `## Background\n\nExperts say the issue has been building for months, with stakeholders calling for a long-term, evidence-based approach rather than quick fixes.`,
    `> "We are committed to transparency and will share verified updates as they arrive," a spokesperson said.`,
    `TrendoraNews will continue to update this story. Follow the live desk for real-time coverage and check the Fact Check Center for verified information.`,
  ];
  return paras.join("\n\n");
}

async function main() {
  const existing = await db.select({ c: sql<number>`count(*)::int` }).from(articles);
  if (existing[0].c > 0) {
    console.log("Database already seeded — skipping.");
    return;
  }
  console.log("Seeding TrendoraNews…");

  // users
  const userIds: Record<string, number> = {};
  for (const s of STAFF) {
    const [u] = await db
      .insert(users)
      .values({ name: s.name, email: s.email, passwordHash: hashPassword("password123"), role: s.role, verified: s.verified, bio: s.bio })
      .returning();
    userIds[s.role] = u.id;
    userIds[s.email] = u.id;
  }

  // categories
  const catIds: Record<string, number> = {};
  for (const c of CATS) {
    if (!c.slug) continue;
    const [row] = await db
      .insert(categories)
      .values({ name: c.name, slug: c.slug, parentId: c.parent ? catIds[c.parent] ?? null : null, color: c.color, icon: c.icon, description: c.desc })
      .returning();
    catIds[c.slug] = row.id;
  }

  // tags
  const tagIds: Record<string, number> = {};
  for (const t of TAG_POOL) {
    const [row] = await db.insert(tags).values({ name: t, slug: t }).returning();
    tagIds[t] = row.id;
  }

  // articles
  const now = Date.now();
  let articleCount = 0;
  for (const a of ARTICLES) {
    const slug = slugify(a.title).slice(0, 180) + `-${articleCount}`;
    const publishedAt = new Date(now - a.hoursAgo * 3600 * 1000);
    const content = contentOf(a);
    const [art] = await db
      .insert(articles)
      .values({
        slug,
        title: a.title,
        excerpt: a.excerpt,
        content,
        coverImage: "",
        authorId: userIds[["reporter", "writer", "editor", "senior_editor"][articleCount % 4]],
        categoryId: catIds[a.cat] ?? null,
        country: a.country,
        region: a.region,
        type: a.type,
        status: "published",
        factCheckStatus: a.fact ?? "pending",
        featured: !!a.featured,
        breaking: !!a.breaking,
        editorChoice: !!a.editor,
        views: 100 + Math.floor(Math.random() * 9000),
        likes: 5 + Math.floor(Math.random() * 400),
        shares: Math.floor(Math.random() * 300),
        readingTime: readingTimeMinutes(content),
        seoTitle: a.title,
        seoDescription: a.excerpt,
        publishedAt,
        updatedAt: publishedAt,
      })
      .returning();
    for (const t of a.tags) {
      if (tagIds[t]) await db.insert(articleTags).values({ articleId: art.id, tagId: tagIds[t] }).onConflictDoNothing();
    }
    await db.insert(articleSources).values({
      articleId: art.id,
      label: "TrendoraNews Research Desk",
      url: "https://trendora.news",
    });
    articleCount++;
  }

  // category counts
  for (const [slug, id] of Object.entries(catIds)) {
    const direct = await db.select({ c: sql<number>`count(*)::int` }).from(articles).where(eq(articles.categoryId, id));
    let count = direct[0].c;
    // include children counts for parents
    for (const c of CATS) {
      if (c.parent === slug) {
        const childId = catIds[c.slug];
        const cc = await db.select({ c: sql<number>`count(*)::int` }).from(articles).where(eq(articles.categoryId, childId));
        count += cc[0].c;
      }
    }
    await db.update(categories).set({ articleCount: count }).where(eq(categories.id, id));
  }

  // breaking news
  for (const b of BREAKING) {
    const slug = slugify(b.title).slice(0, 180);
    const [bn] = await db
      .insert(breakingNews)
      .values({
        slug,
        title: b.title,
        summary: b.summary,
        content: b.content ?? "",
        status: b.status,
        severity: b.severity,
        country: b.country,
        categoryId: catIds["national"],
        startedAt: new Date(now - 5 * 3600 * 1000),
        updatedAt: new Date(now - 30 * 60 * 1000),
        expiresAt: b.status === "live" ? new Date(now + 24 * 3600 * 1000) : null,
      })
      .returning();
    b.updates.forEach((u, i) => {
      // insert sequentially below
    });
    for (let i = 0; i < b.updates.length; i++) {
      await db.insert(breakingUpdates).values({
        breakingId: bn.id,
        content: b.updates[i],
        authorId: userIds["editor"],
        createdAt: new Date(now - (b.updates.length - i) * 45 * 60 * 1000),
      });
    }
    // link one breaking article
    const artRow = await db.select().from(articles).where(eq(articles.breaking, true)).limit(1);
    if (artRow.length) {
      await db.update(breakingNews).set({ articleId: artRow[0].id }).where(eq(breakingNews.id, bn.id));
    }
    // notifications for users
    for (const s of STAFF) {
      await db.insert(notifications).values({ userId: userIds[s.email], type: "breaking", message: `🚨 ${b.title}`, link: `/breaking/${slug}` });
    }
  }

  // media
  const MEDIA = [
    { url: "/covers/news.svg", type: "image", title: "News cover", alt: "TrendoraNews general news cover" },
    { url: "/covers/politics.svg", type: "image", title: "Politics cover", alt: "Politics section cover" },
    { url: "/covers/sports.svg", type: "image", title: "Sports cover", alt: "Sports section cover" },
    { url: "/covers/technology.svg", type: "image", title: "Technology cover", alt: "Technology section cover" },
    { url: "/covers/science.svg", type: "image", title: "Science cover", alt: "Science section cover" },
    { url: "/covers/demo-video.mp4", type: "video", title: "Sample video bulletin", alt: "Video news sample" },
  ];
  for (const m of MEDIA) {
    await db.insert(media).values({ url: m.url, type: m.type as "image" | "video", title: m.title, alt: m.alt, uploadedBy: userIds["admin"], metadata: { seeded: true } });
  }

  // newsletter, searches, comments, engagement, page views
  for (const e of ["subscriber1@example.com", "subscriber2@example.com", "newsfan@example.com"]) {
    await db.insert(newsletter).values({ email: e }).onConflictDoNothing();
  }
  const SEARCH_POOL = ["flood Bangladesh", "cricket world cup", "AI news", "stock market today", "climate change", "Padma Bridge", "space mission", "dengue vaccine"];
  for (const q of SEARCH_POOL) {
    for (let i = 0; i < 2 + Math.floor(Math.random() * 5); i++) {
      await db.insert(searches).values({ query: q, results: Math.floor(Math.random() * 20) });
    }
  }
  const someArticles = await db.select().from(articles).limit(10);
  for (const a of someArticles) {
    await db.insert(comments).values({ articleId: a.id, userId: userIds["reader@trendora.news"], authorName: "Demo Reader", content: "Great coverage — very informative! 👏" });
    await db.insert(comments).values({ articleId: a.id, userId: null, authorName: "Guest", content: "Thanks for the update. Waiting for more details." });
    await db.insert(likes).values({ articleId: a.id, userId: userIds["reader@trendora.news"] }).onConflictDoNothing();
    await db.insert(bookmarks).values({ articleId: a.id, userId: userIds["reader@trendora.news"] }).onConflictDoNothing();
    await db.insert(reads).values({ userId: userIds["reader@trendora.news"], articleId: a.id });
  }
  for (let i = 0; i < 120; i++) {
    const a = someArticles[i % someArticles.length];
    await db.insert(pageViews).values({
      path: i % 3 === 0 ? "/" : `/article/${a.slug}`,
      articleId: i % 3 === 0 ? null : a.id,
      sessionId: `seed-session-${i % 40}`,
      country: ["Bangladesh", "India", "United States", "United Kingdom", "UAE"][i % 5],
      referrer: i % 4 === 0 ? "https://google.com" : i % 4 === 1 ? "https://facebook.com" : "direct",
      device: i % 3 === 0 ? "mobile" : "desktop",
      at: new Date(now - Math.floor(Math.random() * 24) * 3600 * 1000),
    });
  }

  // explorers data
  for (const c of COUNTRY_DATA) {
    await db.insert(countries).values({
      name: c.name, code: c.code, region: c.region, capital: c.capital, population: c.population,
      currency: c.currency, languages: c.languages, summary: c.summary, mapX: c.x, mapY: c.y,
    }).onConflictDoNothing();
  }
  for (const a of ANIMALS) {
    await db.insert(animals).values({
      name: a.name, scientificName: a.scientific, slug: slugify(a.name), habitat: a.habitat, diet: a.diet,
      conservation: a.conservation, lifespan: a.lifespan, facts: a.facts, emoji: a.emoji,
    }).onConflictDoNothing();
  }
  for (const s of SPACE) {
    await db.insert(spaceObjects).values({
      name: s.name, slug: slugify(s.name), type: s.type as "planet", distance: s.distance, diameter: s.diameter,
      description: s.description, facts: s.facts, emoji: s.emoji,
    }).onConflictDoNothing();
  }
  for (const t of TIMELINE) {
    await db.insert(timelineEvents).values({ year: t.year, title: t.title, description: t.description, category: t.category, country: t.country, emoji: t.emoji });
  }
  for (const e of EXPLAINERS) {
    await db.insert(explainers).values({ slug: e.slug, title: e.title, summary: e.summary, content: e.content, category: e.category, difficulty: e.difficulty });
  }
  for (const f of FACTCHECKS) {
    await db.insert(factChecks).values({ claim: f.claim, verdict: f.verdict as "true", explanation: f.explanation, checkerId: userIds["fact_checker"] });
  }

  console.log(`✅ Seeded: ${articleCount} articles, ${CATS.length} categories, ${BREAKING.length} breaking stories, ${COUNTRY_DATA.length} countries, ${ANIMALS.length} animals, ${SPACE.length} space objects, ${TIMELINE.length} timeline events, ${EXPLAINERS.length} explainers, ${FACTCHECKS.length} fact checks, ${STAFF.length} users.`);
  console.log("Demo logins: admin@trendora.news / editor@trendora.news / reporter@trendora.news / factcheck@trendora.news / reader@trendora.news — password: password123");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
