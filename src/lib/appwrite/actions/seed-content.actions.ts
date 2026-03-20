"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../server";
import { revalidatePath } from "next/cache";

const DB_ID = process.env.APPWRITE_DATABASE_ID!;

/* ─────────────────────────────────────────────────────────────────────────────
   JOBS — full job descriptions, 200-400 words each, formatted with line breaks
───────────────────────────────────────────────────────────────────────────── */
const JOBS: Array<{
  bizName: string;
  title: string;
  type: string;
  salary: string;
  loc: string;
  hours: number;
  visa: boolean;
  chinese: string;
  district: string;
  deadline: string;
  benefits: string;
  requirements: string;
}> = [
  // ── TSMC ──────────────────────────────────────────────────────────────────
  {
    bizName: "Taiwan Semiconductor Manufacturing Co. (TSMC)",
    title: "AI & Machine Learning Research Intern",
    type: "Internship",
    salary: "35,000–45,000 TWD/month",
    loc: "Hsinchu Science Park, Building 6",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Hsinchu Science Park",
    deadline: "2026-06-30",
    benefits: `Compensation & Financial
• Monthly stipend: 35,000–45,000 TWD (based on degree level and department)
• Housing allowance: 5,000 TWD/month
• Meal subsidy: 150 TWD per working day (canteen credit)
• Round-trip MRT/bus reimbursement from Hsinchu Station

On-site Perks
• Free TSMC shuttle bus from Hsinchu HSR Station to fab campus
• Access to TSMC Sports Center (gym, tennis courts, swimming pool)
• On-campus convenience stores, cafeteria, and coffee shop
• Free Wi-Fi across all buildings and dormitory

Career Development
• Weekly tech talks with TSMC senior engineers and researchers
• Opportunity to co-author internal technical reports
• Full-time conversion consideration for outstanding interns (Top 15% eligible)
• Access to TSMC e-Learning platform with 1,000+ courses

Health & Insurance
• National Health Insurance enrollment from Day 1
• TSMC group accident insurance coverage throughout internship`,
    requirements: `About the Role

TSMC's AI Research Division is looking for a passionate and talented Machine Learning Research Intern to join our cutting-edge R&D team in Hsinchu. You will work alongside world-class semiconductor and AI engineers to develop intelligent systems that optimize chip manufacturing processes — from yield prediction to defect classification and process control.

This is not a typical internship. You will have direct access to proprietary manufacturing data, state-of-the-art GPU clusters, and mentorship from engineers who have published at top AI venues including NeurIPS, ICML, and ICCV.

What You Will Do
• Develop and train deep learning models for semiconductor defect detection using wafer map data
• Build time-series forecasting models to predict process drift and equipment failures
• Collaborate with process engineers to translate domain knowledge into ML feature engineering
• Benchmark model performance and optimize inference latency for production deployment
• Document research findings and present results to cross-functional engineering teams

Required Qualifications
• Currently pursuing a Master's or PhD in Computer Science, Electrical Engineering, or related field
• Strong proficiency in Python; hands-on experience with PyTorch or TensorFlow
• Solid understanding of supervised learning, CNNs, and time-series modeling
• Ability to read and implement algorithms from research papers
• Professional-level English communication (written and verbal)

Preferred Qualifications
• Prior internship or research experience in industrial AI or computer vision
• Familiarity with semiconductor manufacturing concepts (wafer, fab, yield)
• Experience with MLflow, DVC, or other ML experiment tracking tools
• Publications or research projects you can discuss in the interview

Duration: 4–6 months (negotiable based on academic calendar)
Location: TSMC R&D Building 6, Hsinchu Science Park (on-site required)`,
  },
  {
    bizName: "Taiwan Semiconductor Manufacturing Co. (TSMC)",
    title: "Process Integration Engineer (Entry Level)",
    type: "Full-time",
    salary: "65,000–85,000 TWD/month",
    loc: "TSMC Fab 18, Hsinchu",
    hours: 40,
    visa: true,
    chinese: "Basic",
    district: "Hsinchu City",
    deadline: "2026-07-31",
    benefits: `Compensation & Financial
• Base salary: 65,000–85,000 TWD/month (commensurate with degree and experience)
• Annual performance bonus: 2–4 months' salary
• TSMC Employee Stock Purchase Program (ESPP) — 15% discount on TWSE-listed shares
• Year-end bonus and mid-year bonus

Health & Wellness
• Comprehensive health insurance for employee and dependents
• Annual health check-up at TSMC medical center
• On-site gym, swimming pool, and sports facilities
• Mental health support hotline and counseling services

Career & Learning
• Structured 3-month onboarding and training program
• Annual education allowance (20,000 TWD for external courses/certifications)
• Clear 5-year career ladder: Engineer → Senior Engineer → Technology Leader
• Internal transfer opportunities to advanced packaging, R&D, or overseas fabs

Work Environment
• Free shuttle bus network across Hsinchu, Taoyuan, and Taipei
• On-campus dormitory (priority for new graduates, subsidized at 3,500 TWD/month)
• Daily meal subsidy 150 TWD at 6 on-campus cafeterias
• Company-wide sports day, annual trip, and team building budget`,
    requirements: `About the Role

As a Process Integration Engineer at TSMC Fab 18 — our most advanced 3nm manufacturing facility — you will play a critical role in ensuring the highest standards of chip production quality and yield. You will work at the intersection of physics, chemistry, and engineering to solve real-world problems that directly impact the chips powering iPhones, NVIDIA GPUs, and next-generation AI accelerators.

This is a hands-on, high-responsibility role from Day 1. You will be assigned to a specific process module (e.g., lithography, etch, deposition, CMP) and gradually expand ownership as your expertise grows.

Key Responsibilities
• Monitor and optimize assigned process modules to maintain yield targets above SPC control limits
• Investigate process excursions and non-conformances using root cause analysis (RCA) methodologies
• Collaborate with equipment engineers, yield engineers, and R&D teams to implement process improvements
• Generate and present daily/weekly process performance reports to module leaders
• Participate in new process qualification and technology transfer activities
• Support customer technical meetings and respond to quality queries when required

Required Qualifications
• Bachelor's or Master's degree in Materials Science, Chemical Engineering, Physics, or Electrical Engineering
• Understanding of semiconductor device physics and CMOS fabrication fundamentals
• Analytical mindset with proficiency in data analysis tools (Excel, JMP, Python a plus)
• Ability to work in a 24/7 cleanroom manufacturing environment (rotating shifts may apply for first 6 months)
• Basic Mandarin reading ability for internal documentation (company will provide training)
• Strong commitment to precision, documentation, and safety protocols

Preferred Qualifications
• Thesis or research project related to thin film deposition, lithography, or device characterization
• Internship experience in a semiconductor or related manufacturing environment
• Familiarity with statistical process control (SPC) or six sigma concepts`,
  },
  {
    bizName: "Taiwan Semiconductor Manufacturing Co. (TSMC)",
    title: "Software Engineer — EDA Tools Development",
    type: "Full-time",
    salary: "75,000–100,000 TWD/month",
    loc: "TSMC Technology Center, Taipei",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Zhongzheng District, Taipei",
    deadline: "2026-08-31",
    benefits: `Compensation
• Monthly salary: 75,000–100,000 TWD (based on experience)
• Annual bonus: 3–5 months' salary
• Phantom stock / performance share units for senior contributors
• Remote work: 2 days/week from home after 3-month probation

Flexibility & Life Balance
• Core hours: 10am–4pm (flexible start/end outside core)
• 15 days annual leave from Year 1 (increasing to 30 days by Year 10)
• Paid sabbatical program after 7 years of service
• Education leave for degree programs

Tech & Tools
• MacBook Pro / high-spec workstation provided
• Software and cloud compute budget (AWS/GCP credits for personal dev)
• Annual conference attendance allowance (1 international conference/year)
• Access to TSMC's internal research library and patent database

Community
• Vibrant engineer community in Taipei office (500+ software engineers)
• Quarterly hackathons with prizes up to 50,000 TWD
• Engineering blog and internal tech talk program`,
    requirements: `About the Role

TSMC's EDA (Electronic Design Automation) Tools team in Taipei develops the proprietary software infrastructure that underpins the world's most advanced chip design and verification workflows. Our tools are used by thousands of engineers at TSMC and at customer companies including Apple, NVIDIA, Qualcomm, and AMD.

You will join a team of ~80 software engineers building large-scale C++ systems, Python automation pipelines, and AI-assisted design tools. Unlike traditional software roles, you will work at the boundary of hardware and software — understanding both the physics of chip fabrication and the software engineering required to model it at scale.

What You Will Build
• Core EDA tool components: DRC (Design Rule Check) engines, LVS checkers, parasitic extraction tools
• Automation frameworks that reduce manual engineering effort in process design kit (PDK) development
• AI/ML modules for predicting lithographic hotspots and layout violations before tape-out
• Internal developer tools, CI/CD pipelines, and test automation infrastructure
• APIs and UIs used by TSMC customers to integrate their design flows with TSMC processes

Required Qualifications
• Bachelor's or Master's in Computer Science, Software Engineering, or related field
• Expert-level proficiency in C++ (C++14 or later); strong understanding of data structures and algorithms
• Experience building large, multi-module software projects (not just scripts or notebooks)
• Proficiency in Python for scripting, automation, and data analysis
• Excellent English communication — this team collaborates with engineers in Hsinchu, Austin, and Japan daily

Preferred Qualifications
• Academic or industry exposure to EDA concepts (VLSI CAD, SPICE, Verilog/VHDL)
• Experience with parallel computing (OpenMP, MPI) or GPU programming (CUDA)
• Familiarity with semiconductor design flows (synthesis, place & route, sign-off)
• Open-source contributions or personal GitHub projects you can discuss`,
  },

  // ── ASUS ──────────────────────────────────────────────────────────────────
  {
    bizName: "ASUSTeK Computer Inc. (ASUS)",
    title: "Hardware Design Engineer — Gaming Laptops",
    type: "Full-time",
    salary: "55,000–75,000 TWD/month",
    loc: "ASUS HQ, Beitou District, Taipei",
    hours: 40,
    visa: true,
    chinese: "Basic",
    district: "Beitou District, Taipei",
    deadline: "2026-06-15",
    benefits: `Compensation & Bonuses
• Base salary: 55,000–75,000 TWD/month
• Year-end bonus (average 2–3 months in recent years)
• Profit-sharing bonus based on product line performance
• ASUS Employee Stock Ownership Plan (ESOP)

Product Benefits
• Generous employee product discount (30–50% off ASUS retail products)
• Annual product allowance: 15,000 TWD (usable on any ASUS product)
• Pre-launch access to new products for testing and feedback

Work Environment
• Modern 35-floor headquarters in Beitou, Taipei
• On-site gym, basketball court, and rooftop garden
• Subsidized cafeteria with international cuisine options
• Free parking for employees with vehicles or scooters

Career Development
• Biannual performance review with structured promotion path
• Cross-department rotation program for first 2 years
• Budget for external training, certifications, and conference attendance
• ASUS Global Talent Exchange Program (rotation to offices in USA, EU, Japan)`,
    requirements: `About the Role

Join ASUS's award-winning Republic of Gamers (ROG) design team and help shape the next generation of gaming laptops that millions of players worldwide depend on. As a Hardware Design Engineer, you will take ownership of specific hardware subsystems — from thermal architecture to power delivery — and drive them from concept through mass production.

ASUS's ROG division has won over 4,000 design and innovation awards globally. If you want your engineering work to be seen, felt, and used by real consumers in 50+ countries, this role is for you.

Key Responsibilities
• Lead hardware design for assigned subsystems: thermal management, power delivery, audio circuitry, or I/O expansion
• Create and review schematics, PCB layouts, and BOM (bill of materials) with EMS partners
• Conduct electrical validation, signal integrity analysis, and EMI/EMC pre-compliance testing
• Coordinate with industrial designers and firmware teams to deliver an integrated product experience
• Travel to manufacturing partners in China and Taiwan for NPI (New Product Introduction) builds
• Write detailed engineering specifications and design verification reports

Required Qualifications
• Bachelor's or Master's in Electrical Engineering or Mechanical Engineering
• 1–3 years of hardware design experience (fresh graduates with strong internship background considered)
• Proficiency in PCB design tools (Altium Designer, Cadence Allegro, or equivalent)
• Working knowledge of thermal simulation tools (ANSYS Icepak or similar)
• Basic Mandarin for collaboration with manufacturing teams in Taiwan and mainland China
• Strong documentation skills and attention to detail

Preferred Qualifications
• Experience with laptop or mobile device hardware design
• Familiarity with USB4, Thunderbolt 5, DDR5, or PCIe Gen 5 specifications
• Knowledge of IPC standards and DFM (Design for Manufacturability) principles
• A gaming background is genuinely valued — we build products we love to use`,
  },
  {
    bizName: "ASUSTeK Computer Inc. (ASUS)",
    title: "Global Marketing Specialist — EU & NA Region",
    type: "Full-time",
    salary: "50,000–65,000 TWD/month",
    loc: "ASUS Global HQ, Taipei",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Beitou District, Taipei",
    deadline: "2026-07-01",
    benefits: `Compensation
• Base salary: 50,000–65,000 TWD/month
• Annual marketing performance bonus
• International travel budget (4–6 trips/year to EU and North America)
• Remote work option: up to 2 days/week

Global Exposure
• Direct collaboration with ASUS subsidiary offices in the Netherlands, Germany, and US
• Attend major tech events: CES Las Vegas, Computex Taipei, Gamescom Cologne
• Work with global influencers, media outlets, and retail partners
• Annual global marketing summit (location rotates between Taipei, Amsterdam, and LA)

Benefits
• Product allowance: 20,000 TWD/year
• Language learning subsidy (any language, 10,000 TWD/year)
• Comprehensive health insurance
• Hybrid work arrangement after 3-month onboarding`,
    requirements: `About the Role

ASUS's Global Marketing team in Taipei is responsible for brand strategy, product launches, and go-to-market execution in the European and North American markets — regions that together represent over 40% of ASUS's global revenue. As a Global Marketing Specialist, you will be the bridge between ASUS's Taiwan headquarters and regional teams abroad.

This role is ideal for someone who is culturally fluent in English-speaking markets, has a strong grasp of digital marketing strategy, and can execute at both strategic and tactical levels. You will manage campaigns for product lines including ROG gaming, ASUS ProArt, and Zenbook — some of the most recognizable laptop brands in the world.

Key Responsibilities
• Develop and execute integrated marketing campaigns for EU and NA product launches
• Manage relationships with regional distributors, retailers (Best Buy, Amazon, MediaMarkt), and media partners
• Brief and oversee creative agencies producing video content, digital ads, and retail materials
• Analyze campaign performance metrics (impressions, CTR, conversion, ROI) and optimize spend allocation
• Coordinate influencer marketing programs with YouTube creators and tech media (Linus Tech Tips, JerryRigEverything, etc.)
• Represent ASUS at international trade shows including CES, Gamescom, and IFA Berlin
• Work across time zones — daily calls with EU/NA teams (flexible schedule accommodated)

Required Qualifications
• Native or near-native English proficiency (C2 level minimum) — this is the primary working language
• Bachelor's in Marketing, Communications, Business, or related field
• 2+ years of experience in digital marketing, brand marketing, or product marketing
• Strong analytical skills with experience using Google Analytics, Meta Ads Manager, or similar platforms
• Excellent presentation and storytelling skills

Preferred Qualifications
• Experience marketing consumer electronics or tech products
• Background in EU or North American consumer culture (lived or studied there)
• Fluency in German, French, or Spanish is a bonus
• Passion for PC hardware and gaming`,
  },
  {
    bizName: "ASUSTeK Computer Inc. (ASUS)",
    title: "Mobile App Developer — React Native & iOS",
    type: "Full-time",
    salary: "60,000–80,000 TWD/month",
    loc: "ASUS Software Innovation Center, Neihu, Taipei",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Neihu District, Taipei",
    deadline: "2026-07-15",
    benefits: `Tech & Compensation
• Salary: 60,000–80,000 TWD/month
• Annual bonus: 1.5–3 months
• Equipment: MacBook Pro M3, iPhone 15 Pro, and latest ASUS device for testing
• Software subscriptions: Apple Developer account, Figma, JetBrains All Products Pack

Flexibility
• Work from home 3 days/week after 3-month onboarding
• Flexible core hours: 10am–4pm (arrive/leave as needed outside these)
• 15 days annual leave from Year 1

Growth
• Conference attendance: 1 international (WWDC, Google I/O, or similar) per year
• Internal knowledge-sharing sessions every two weeks
• Clear career path: Junior → Mid → Senior → Staff Engineer`,
    requirements: `About the Role

ASUS's mobile software team builds the companion apps that connect millions of users to their ASUS devices — from ROG Phone gaming features to ASUS router management and PC remote control. As a Mobile App Developer, you will ship features used daily by 5M+ active users worldwide.

You will work in a cross-functional team of designers, backend engineers, and product managers using agile methodologies. You'll have real ownership of features from design review through App Store / Google Play release.

What You Will Build
• New features and screens in the ASUS Router (ZenWiFi) iOS and Android app
• ROG Armoury Crate mobile companion app for gaming configuration and remote control
• Cross-platform UI components using React Native with native module bridges for platform-specific APIs
• CI/CD automation for app builds, testing, and release pipelines using Fastlane and GitHub Actions
• Analytics instrumentation to measure feature adoption and user engagement

Required Qualifications
• 2+ years of experience building and shipping mobile apps to App Store and/or Google Play
• Proficiency in React Native (TypeScript) and familiarity with platform-specific modules
• Experience with iOS development in Swift is a strong plus
• Understanding of mobile UX principles — you care deeply about how the app feels, not just works
• Experience with REST APIs, async data fetching, and state management (Redux, Zustand, or similar)
• Strong English communication for daily collaboration with design and backend teams

Preferred Qualifications
• Published apps in App Store or Google Play that you own and maintain
• Experience with performance profiling and optimization on mobile (JS thread, native bridge)
• Familiarity with Bluetooth LE or Wi-Fi integration for device pairing flows
• Background with gaming peripherals or smart home/IoT apps`,
  },

  // ── SHOPEE ────────────────────────────────────────────────────────────────
  {
    bizName: "Shopee Taiwan (Sea Group)",
    title: "Backend Software Engineer — Go / Python",
    type: "Full-time",
    salary: "70,000–95,000 TWD/month",
    loc: "Shopee Taiwan HQ, Xinyi District, Taipei",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Xinyi District, Taipei",
    deadline: "2026-07-31",
    benefits: `Compensation & Equity
• Base salary: 70,000–95,000 TWD/month (higher for senior candidates)
• RSU (Restricted Stock Units) in Sea Group (NYSE: SE) — 4-year vesting
• Performance bonus: 1–3 months annually
• Relocation package for candidates moving from outside Taipei

Office & Lifestyle
• Premium office in Taipei 101 area with stunning city views
• Catered lunch and dinner on working days (value 200 TWD/meal)
• Unlimited coffee, snacks, and drinks on-site
• Annual company trip (past destinations: Japan, Bali, Korea)
• Team outing budget: 5,000 TWD/person per quarter

Health & Insurance
• Premium health insurance for employee and first-degree family members
• Mental wellness program with 6 free therapy sessions per year
• Annual comprehensive health examination at private hospital

Career Development
• Engineering blog and internal tech talks (Sea Engineering Blog is public)
• Budget for external conferences (AWS re:Invent, KubeCon, PyCon)
• Internal transfer opportunities to Singapore, Indonesia, Vietnam offices`,
    requirements: `About the Role

Shopee Taiwan's engineering team builds and scales the e-commerce platform serving 23 million monthly active users in Taiwan. Our backend systems process millions of transactions daily, handle peak traffic spikes during 11.11 and 12.12 sales events (50x normal load), and power features including instant payment, live streaming commerce, and AI-driven product recommendations.

As a Backend Software Engineer, you will design, build, and operate critical microservices in our distributed platform. You will own services end-to-end — from architecture decisions to production monitoring — and work alongside some of the best engineers in Southeast Asia's tech ecosystem.

What You Will Work On
• High-throughput order processing and inventory management services (millions of requests/day)
• Real-time pricing and promotion engine that applies dynamic discounts to 30M+ SKUs
• Seller tools APIs: listing management, shipping integration, analytics dashboard backends
• Platform infrastructure: service mesh, rate limiting, circuit breaker, and observability tooling
• Database optimization: query tuning, sharding strategy, and cache invalidation for MySQL and Redis
• Participate in on-call rotation for your service domain (pager duty rotated fairly)

Required Qualifications
• 2+ years of backend development experience in a production environment
• Proficiency in Go and/or Python — Go is preferred for new service development
• Hands-on experience with microservices architecture and REST/gRPC API design
• Strong understanding of distributed systems concepts: consistency, availability, partitioning, idempotency
• Experience with message queues (Kafka, RabbitMQ) and caching (Redis)
• Excellent English communication — all engineering documentation and standups are in English

Preferred Qualifications
• Experience handling high-traffic events (flash sales, product drops)
• Familiarity with Kubernetes, Docker, and cloud infrastructure (AWS or GCP)
• Open source contributions or side projects demonstrating independent engineering judgment`,
  },
  {
    bizName: "Shopee Taiwan (Sea Group)",
    title: "Data Analyst — Seller Operations",
    type: "Part-time",
    salary: "200–280 TWD/hour",
    loc: "Shopee Taiwan, Xinyi District, Taipei",
    hours: 20,
    visa: true,
    chinese: "Conversational",
    district: "Xinyi District, Taipei",
    deadline: "2026-05-31",
    benefits: `Compensation
• Hourly rate: 200–280 TWD (based on experience)
• Performance bonus for project completion
• Flexible scheduling: choose your 20 hours within Mon–Fri 9am–10pm

Perks
• Office access with free meals during on-site hours
• Shopee mall vouchers (1,000 TWD/month)
• Potential full-time conversion after 6 months
• Official NHI enrollment (National Health Insurance)`,
    requirements: `About the Role

Shopee Taiwan's Seller Operations team is looking for a sharp Data Analyst to support our seller success initiatives on a part-time basis. This is an excellent opportunity for graduate students in statistics, business analytics, or computer science who want real-world data experience at one of Asia's largest e-commerce platforms.

You will work with actual transaction and seller performance data to help Shopee improve the seller experience, reduce platform friction, and grow category GMV.

What You Will Do
• Query and analyze seller performance data using SQL (BigQuery) and Python/Pandas
• Build dashboards in Tableau or Looker tracking KPIs: seller NPS, order cancellation rate, response time, GMV by category
• Identify underperforming seller segments and propose data-driven intervention strategies
• Support A/B test design and result interpretation for seller incentive campaigns
• Prepare bi-weekly executive reports summarizing seller ecosystem health

Required Qualifications
• Currently enrolled in a university program (Bachelor or Master) — final year preferred
• Proficiency in SQL (ability to write complex multi-table joins, window functions, aggregations)
• Good working knowledge of Excel or Google Sheets for reporting
• Conversational Mandarin Chinese for communicating with Taiwanese sellers and internal ops team
• Attention to detail and ability to meet weekly reporting deadlines

Preferred Qualifications
• Experience with Python (Pandas, Matplotlib) or R for data manipulation
• Familiarity with e-commerce metrics (GMV, conversion rate, AOV, CAC)
• Prior internship or part-time experience in a data role
• Comfort with ambiguous, messy real-world data`,
  },
  {
    bizName: "Shopee Taiwan (Sea Group)",
    title: "Product Manager Intern — Logistics Tech",
    type: "Internship",
    salary: "28,000–35,000 TWD/month",
    loc: "Shopee Taiwan HQ, Xinyi, Taipei",
    hours: 40,
    visa: true,
    chinese: "Basic",
    district: "Xinyi District, Taipei",
    deadline: "2026-05-15",
    benefits: `Internship Package
• Monthly stipend: 28,000–35,000 TWD
• Catered lunch and dinner on working days
• Dedicated PM mentor (Senior PM with 5+ years experience)
• Full-time return offer consideration for top performers

Learning
• Access to Shopee's internal PM onboarding curriculum
• Weekly "PM Talk" sessions with Shopee product leaders from Taiwan, Singapore, Vietnam
• Access to Shopee's real user research panels and usability testing sessions
• Certificate of completion and LinkedIn recommendation from manager`,
    requirements: `About the Role

Shopee's Logistics Technology team builds the systems that coordinate 500,000+ daily deliveries across Taiwan — from warehouse picking to last-mile courier dispatch. We are looking for a Product Manager Intern to help us design and ship features that make logistics faster, cheaper, and more transparent for both sellers and buyers.

This is a high-impact, high-responsibility internship. Within your first month, you will be owning a real product surface used by thousands of logistics operations staff daily.

What You Will Own
• User story writing and PRD (Product Requirements Document) creation for logistics operations tools
• Competitive analysis of logistics tech trends in Taiwan, Japan, and Southeast Asia
• Coordination with engineering, data, and design teams during sprint planning and sprint reviews
• User interviews with Shopee warehouse managers and delivery partners to gather pain points
• Definition and tracking of success metrics for your features post-launch

Required Qualifications
• Currently enrolled in a university program (Business, CS, Industrial Engineering, or related)
• Strong analytical mindset — comfortable forming hypotheses and testing them with data
• Excellent English (written and spoken) for daily communication with regional teams
• Basic Mandarin sufficient for interviewing Taiwanese users and communicating with local ops staff
• Structured thinker who can translate ambiguous problems into clear product requirements

Preferred Qualifications
• Prior PM internship, product-adjacent internship, or demonstrated product-thinking projects
• Familiarity with Figma for annotating wireframes and communicating with designers
• Understanding of SQL basics (will be trained, but a head start helps)
• Genuine interest in logistics, supply chain, or operations technology

Duration: 3–6 months | Start: flexible from March 2026`,
  },

  // ── LINE ──────────────────────────────────────────────────────────────────
  {
    bizName: "LINE Taiwan Limited",
    title: "Frontend Engineer — React / TypeScript",
    type: "Full-time",
    salary: "65,000–88,000 TWD/month",
    loc: "LINE Taiwan HQ, Zhongshan District, Taipei",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Zhongshan District, Taipei",
    deadline: "2026-08-01",
    benefits: `Compensation
• Monthly salary: 65,000–88,000 TWD
• Performance bonus: 1–2 months annually
• LINE Pay credit: 3,000 TWD/month (usable at LINE-affiliated merchants)
• Annual salary review with market benchmarking

Work-Life Balance
• WFH: 3 days/week (engineer's choice)
• 15 days annual leave, 10 days sick leave, 3 days personal leave
• Flexible working hours: arrive 8–11am, depart accordingly
• No mandatory overtime culture — PTO strongly encouraged

Tech & Equipment
• MacBook Pro (employee choice of spec)
• External monitor, ergonomic keyboard, and standing desk
• Cloud and SaaS subscription budget: 5,000 TWD/year
• Annual hardware refresh every 3 years

Community & Growth
• LINE TECHPULSE annual conference (Taiwan's largest tech conference, hosted by LINE)
• Internal open-source contribution time (10% of work time)
• Engineering Blog participation encouraged and recognized
• Gym reimbursement: 2,000 TWD/month at any fitness facility`,
    requirements: `About the Role

LINE Taiwan's frontend engineering team builds the web experiences used by 21 million Taiwanese users across LINE's services: LINE SHOPPING (Taiwan's largest social commerce platform), LINE TODAY news, LINE MUSIC, and LINE Pay merchant portals.

We are a product-oriented engineering team that values clean code, user empathy, and engineering craftsmanship. You will work in squads of 4–8 people (frontend, backend, design, PM) using continuous deployment — we ship to production multiple times per day.

What You Will Build
• New features and performance improvements for LINE SHOPPING's web storefront (millions of daily visits)
• Internal seller management portals used by 300,000+ merchants on LINE's commerce platform
• Reusable component library (Design System) used across all LINE Taiwan web products
• A/B testing infrastructure and feature flag integration for controlled rollouts
• Web performance optimization: Core Web Vitals, code splitting, lazy loading, SSR/ISR strategies

Required Qualifications
• 3+ years of frontend development experience
• Expert-level React.js and TypeScript — you understand hooks, context, memoization, and rendering deeply
• Experience building large SPAs with complex state management (Redux, Zustand, or Jotai)
• Strong understanding of browser fundamentals: event loop, rendering pipeline, Web APIs
• Familiarity with modern build tooling: Vite, Webpack, ESBuild
• Professional English proficiency for collaboration with LINE Japan and Korea engineering teams

Preferred Qualifications
• Experience with Next.js (App Router) or other SSR/SSG frameworks
• Contributions to open-source projects (share your GitHub)
• Experience building and maintaining Design System component libraries
• Background in web accessibility (WCAG 2.1 AA compliance)
• Interest in performance engineering and measurement (Lighthouse, Web Vitals, RUM)`,
  },
  {
    bizName: "LINE Taiwan Limited",
    title: "LINE Pay — Fintech Backend Engineer",
    type: "Full-time",
    salary: "72,000–98,000 TWD/month",
    loc: "LINE Taiwan, Zhongshan District, Taipei",
    hours: 40,
    visa: true,
    chinese: "Basic",
    district: "Zhongshan District, Taipei",
    deadline: "2026-08-31",
    benefits: `Compensation & Equity
• Monthly salary: 72,000–98,000 TWD (one of highest ranges in Taiwan fintech)
• Year-end bonus: 2–4 months
• LINE Corp. restricted stock units (RSU) for senior hires
• Annual salary increase guaranteed at minimum inflation rate

Fintech Lifestyle
• LINE Pay credit: 5,000 TWD/month (own your product)
• Priority access to new LINE Pay features during beta
• Travel to LINE Japan HQ (Tokyo) quarterly for team syncs
• Compliance and fintech certification allowance: 15,000 TWD/year (CISM, CPA, etc.)

Work Environment
• Beautiful office on Zhongshan North Road — close to MRT Shuanglian
• Catered breakfast and afternoon snacks daily
• No dress code (casual but professional)
• Dog-friendly office days (Fridays)`,
    requirements: `About the Role

LINE Pay is Taiwan's most widely adopted mobile payment platform, processing billions of TWD in transactions monthly across grocery stores, restaurants, e-commerce, and public transit. As a Fintech Backend Engineer, you will work on the core payment processing infrastructure that millions of Taiwanese consumers and merchants rely on every day.

This role sits at the heart of LINE Pay's engineering team in Taiwan, with close collaboration with LINE's global fintech engineering hub in Tokyo. You will design systems where correctness, security, and auditability are non-negotiable — and where a single bug can impact real money.

What You Will Engineer
• Core payment transaction processing services: authorization, clearing, settlement, and reconciliation
• Merchant onboarding and KYC (Know Your Customer) systems with regulatory compliance requirements
• Real-time fraud detection pipelines integrating rule engines and ML models
• Open Banking API integrations with Taiwan's major banks (CTBC, Fubon, Cathay)
• Event-driven architecture for payment event streaming (Kafka) and audit logging
• Participate in 24/7 on-call rotation for Tier-1 payment system incidents

Required Qualifications
• 3+ years of backend engineering experience in a production environment
• Proficiency in Java (Spring Boot) or Kotlin — LINE Pay's primary backend language
• Strong understanding of distributed transactions, idempotency, and eventual consistency
• Experience with relational databases (MySQL, PostgreSQL) at production scale
• Awareness of financial regulatory concepts: PCI-DSS, AML, KYC
• Basic Mandarin reading ability for Taiwanese regulatory documentation (training provided)

Preferred Qualifications
• Prior experience in payment systems, banking infrastructure, or fintech
• Knowledge of ISO 8583 or ISO 20022 financial messaging standards
• Experience with HSM (Hardware Security Module) or cryptographic key management
• AWS Certified Solutions Architect or equivalent cloud certification`,
  },
  {
    bizName: "LINE Taiwan Limited",
    title: "UX/UI Designer — LINE Shopping",
    type: "Part-time",
    salary: "180–250 TWD/hour",
    loc: "LINE Taiwan, Taipei",
    hours: 20,
    visa: true,
    chinese: "Conversational",
    district: "Zhongshan District, Taipei",
    deadline: "2026-06-01",
    benefits: `Compensation
• Hourly rate: 180–250 TWD (based on portfolio and experience)
• Flexible scheduling within Monday–Friday, 9am–7pm
• Remote work permitted for most tasks (on-site for user research sessions)

Designer Perks
• Access to LINE Design System Figma library and brand assets
• Participate in LINE's quarterly user research studies
• Portfolio-building work: your designs will be shipped to millions of real users
• Invitation to LINE TECHPULSE design track sessions`,
    requirements: `About the Role

LINE Shopping's design team is looking for a talented Part-Time UX/UI Designer to help us improve the shopping experience for millions of users. You'll work on specific product areas — product detail pages, checkout flows, and seller storefronts — and collaborate directly with product managers and frontend engineers.

This is a great role for a design student or recent graduate looking to build a real-world portfolio while working alongside a professional design team at one of Taiwan's most recognized tech companies.

What You Will Design
• New UI screens and interaction flows for LINE Shopping's mobile web and LINE mini-app surfaces
• UI components for the LINE Design System (used across all LINE Taiwan products)
• User research artifacts: interview guides, usability test scripts, affinity diagrams
• High-fidelity mockups and interactive prototypes in Figma for developer handoff
• Occasional visual design work: banners, campaign illustrations, social assets

Required Qualifications
• A portfolio demonstrating at least 3 completed design projects (mobile apps or web preferred)
• Proficiency in Figma — including components, auto-layout, and prototype flows
• Understanding of UX principles: information architecture, user flows, accessibility
• Conversational Mandarin for collaborating with Taiwanese PMs, engineers, and user research participants
• Ability to give and receive direct design critique professionally

Preferred Qualifications
• Experience conducting usability testing and translating findings into design decisions
• Understanding of e-commerce UX patterns and conversion optimization
• Motion design skills (Principle, Lottie, or After Effects)
• Currently enrolled in or recently graduated from a design-related degree program`,
  },

  // ── MEDIATEK ──────────────────────────────────────────────────────────────
  {
    bizName: "MediaTek Inc.",
    title: "IC Design Engineer — 5G Modem Frontend",
    type: "Full-time",
    salary: "80,000–120,000 TWD/month",
    loc: "MediaTek HQ, Hsinchu Science Park",
    hours: 40,
    visa: true,
    chinese: "Basic",
    district: "Hsinchu Science Park",
    deadline: "2026-07-31",
    benefits: `Industry-Leading Compensation
• Monthly salary: 80,000–120,000 TWD — among the highest in Taiwan's IC design industry
• Annual bonus: 3–6 months' salary (based on company and personal performance)
• MediaTek stock options (TWSE:2454 — one of Taiwan's most valuable public companies)
• Patent incentive program: 10,000–50,000 TWD per approved patent

Career & Research
• Dedicated R&D budget per engineer: 20,000 TWD/year for courses, books, and tools
• Access to MediaTek's internal 5G standard research library and standards body memberships
• Opportunity to represent MediaTek at 3GPP standardization meetings
• Fast promotion track: Engineer → Senior Engineer → Principal in 4–7 years

Quality of Life
• Free MediaTek shuttle from Hsinchu Station, Jhubei, and Taoyuan
• On-site cafeteria, coffee shop, and convenience store
• Company-subsidized housing for first year (4,500 TWD/month dorm or housing allowance)
• 15 days annual leave from Day 1 (increasing to 25 days by Year 5)`,
    requirements: `About the Role

MediaTek's 5G Modem division is responsible for the Dimensity 5G chipset series — the most widely shipped 5G modem platform in the world, powering flagship smartphones from Xiaomi, OPPO, Samsung, and Sony. As an IC Design Engineer on the 5G Modem Frontend team, you will contribute to the RTL design and verification of baseband components at the cutting edge of wireless communication.

This is a highly technical role requiring deep knowledge of digital design and 5G wireless standards. Your work will directly influence the wireless connectivity experience of hundreds of millions of devices shipped globally.

Key Responsibilities
• RTL design and microarchitecture specification for 5G NR physical layer blocks: LDPC/Polar codecs, OFDM modulators, channel estimators, and HARQ engines
• Functional verification using SystemVerilog/UVM testbenches and constrained random simulation
• Logic synthesis and static timing analysis (STA) using industry-standard EDA tools
• Power analysis and optimization for mobile battery life requirements (a key differentiator for MediaTek)
• Collaborate with algorithm team to implement DSP algorithms from MATLAB reference models
• Support FPGA prototyping and silicon validation teams during tape-out and bring-up phases

Required Qualifications
• Master's or PhD in Electrical Engineering, Communications Engineering, or Computer Engineering
• Proficiency in RTL design using Verilog or SystemVerilog
• Understanding of 5G NR physical layer standards (3GPP Release 15 or later)
• Knowledge of digital signal processing: FFT/IFFT, FIR/IIR filters, channel coding fundamentals
• Experience with simulation tools: ModelSim, VCS, or Xcelium
• Basic Mandarin for daily team communication (engineering documentation is primarily in English)

Preferred Qualifications
• Thesis or research project related to 5G/6G, OFDM, MIMO, or channel coding
• Experience with UVM-based verification methodology
• Familiarity with timing closure, floorplanning, or backend design flows
• Publications at IEEE conferences (VTC, ICC, Globecom, ISSCC) are a strong plus`,
  },
  {
    bizName: "MediaTek Inc.",
    title: "Software Engineer — IoT Cloud Platform",
    type: "Full-time",
    salary: "65,000–85,000 TWD/month",
    loc: "MediaTek, Hsinchu",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Hsinchu City",
    deadline: "2026-08-15",
    benefits: `Compensation
• Salary: 65,000–85,000 TWD/month
• Annual bonus: 2–4 months
• MediaTek stock options (TWSE:2454)
• Flexible start time: 8–10am

Tech Stack & Environment
• Modern cloud-native development environment (AWS/GCP/Azure)
• Developer workstation of your choice (MacBook or high-spec Windows PC)
• Budget for certifications: AWS Solutions Architect, GCP Professional, etc.
• Internal hackathons with prizes up to 100,000 TWD

Work-Life
• Remote work: 1 day/week from Day 1 (up to 3 days after 1 year)
• 15 days paid annual leave from Year 1
• Free gym membership reimbursement (up to 1,500 TWD/month)
• On-site cafeteria and free parking`,
    requirements: `About the Role

MediaTek's IoT Business Unit builds the cloud platform powering smart home devices, industrial sensors, and connected vehicles — all running MediaTek's MT7688, MT7921, and Filogic Wi-Fi/BT chipset families. The Linkit Smart platform and MediaTek IoT Cloud connect millions of devices worldwide from Taipei's consumer electronics brands to global industrial OEMs.

As a Software Engineer on the IoT Cloud Platform team, you will build the backend services, device management APIs, and data pipelines that make all of this work at scale.

What You Will Build
• Device management microservices: OTA firmware update orchestration, device shadow/twin, provisioning APIs
• Real-time telemetry ingestion pipeline processing 50,000+ device events per second (Kafka + Flink)
• Rule engine for device automation (if-this-then-that logic for smart home scenarios)
• REST and MQTT APIs consumed by MediaTek's OEM customers (SDK + documentation)
• Cloud infrastructure automation using Terraform and Helm charts for Kubernetes deployments
• Observability stack: distributed tracing (Jaeger), metrics (Prometheus/Grafana), and alerting

Required Qualifications
• 2+ years of backend development experience
• Proficiency in Go, Java, or Python for backend service development
• Hands-on experience with AWS, GCP, or Azure — deploying and operating production workloads
• Understanding of IoT protocols: MQTT, CoAP, or WebSocket
• Experience with containerization (Docker) and orchestration (Kubernetes)
• Good English communication skills — team documents in English, international OEM customers require English support

Preferred Qualifications
• Familiarity with embedded Linux or device-side firmware concepts
• Experience with BLE, Wi-Fi 6/6E, or Thread/Matter protocol stacks
• AWS Certified Developer or Solutions Architect certification
• Prior work on IoT platforms (AWS IoT Core, Azure IoT Hub, Google Cloud IoT)`,
  },
  {
    bizName: "MediaTek Inc.",
    title: "R&D Intern — AI on Edge Devices",
    type: "Internship",
    salary: "30,000–40,000 TWD/month",
    loc: "MediaTek AI Labs, Hsinchu",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Hsinchu Science Park",
    deadline: "2026-05-31",
    benefits: `Internship Package
• Monthly stipend: 30,000–40,000 TWD
• Housing allowance: 4,500 TWD/month
• Shuttle bus from Hsinchu Station and Jhubei
• Meal subsidy: 100 TWD/day

Research Environment
• Access to MediaTek's GPU cluster for model training experiments
• Weekly mentorship sessions with MediaTek principal researchers
• Opportunity to co-author internal technical reports
• Full-time return offer for top performers (top 20%)
• Access to MediaTek's extensive IP and patent database`,
    requirements: `About the Role

MediaTek's AI Labs is pushing the frontier of on-device AI inference — enabling powerful AI capabilities to run locally on smartphones, wearables, and IoT devices without requiring cloud connectivity. Our work powers features including real-time video super-resolution, neural image signal processing (neural ISP), keyword spotting, and generative AI on Dimensity flagship chipsets.

As an R&D Intern, you will work directly with our research engineers on model optimization and deployment challenges for resource-constrained edge hardware.

What You Will Work On
• Evaluate and optimize neural network models for deployment on MediaTek's APU (AI Processing Unit)
• Apply model compression techniques: structured/unstructured pruning, knowledge distillation, and INT8/INT4 quantization-aware training
• Profile inference latency and memory footprint on target hardware using MediaTek's internal profiling tools
• Implement benchmark harnesses to compare model accuracy vs. efficiency trade-offs across compression configurations
• Survey and implement recent papers from CVPR, ECCV, MLSys, and NeurIPS related to efficient deep learning

Required Qualifications
• Currently pursuing a Master's or PhD in Computer Science, Electrical Engineering, or related field
• Strong Python programming skills and hands-on experience with PyTorch
• Solid understanding of CNN/Transformer architectures and training fundamentals
• Ability to read and implement algorithms from academic papers independently
• Professional English communication

Preferred Qualifications
• Prior experience with model compression, neural architecture search (NAS), or efficient inference
• Familiarity with TensorFlow Lite, ONNX, or TVM for model deployment
• Exposure to mobile or embedded platforms (Android NDK, Arm Compute Library)
• Academic publications or Kaggle competition achievements in relevant domains`,
  },

  // ── GARENA ────────────────────────────────────────────────────────────────
  {
    bizName: "Garena Taiwan (Sea Group)",
    title: "Live Operations Specialist — Free Fire",
    type: "Full-time",
    salary: "45,000–60,000 TWD/month",
    loc: "Garena Taiwan, Da'an District, Taipei",
    hours: 40,
    visa: true,
    chinese: "Conversational",
    district: "Da'an District, Taipei",
    deadline: "2026-06-30",
    benefits: `Compensation
• Salary: 45,000–60,000 TWD/month
• Annual performance bonus
• Garena game credits: unlimited for work accounts, 2,000 TWD/month for personal play
• Sea Group RSU eligibility after 1 year

Gaming Culture
• State-of-the-art gaming PC stations in the office
• Monthly gaming tournament with prizes
• Free Fire VIP account with all characters unlocked
• Attend major esports events as staff (Garena World Championship, IEM, etc.)

Benefits
• Comprehensive health insurance
• Annual company trip (past: Japan, Thailand, Philippines)
• Casual dress code (gaming jerseys welcome)
• Dog-friendly office`,
    requirements: `About the Role

Garena Taiwan operates Free Fire — one of the world's most downloaded mobile battle royale games with 100M+ monthly active players globally. As a Live Operations Specialist, you will be responsible for planning, executing, and analyzing in-game events, seasonal content, and limited-time modes that keep millions of Free Fire players engaged and spending in the Taiwan market.

This role blends data analysis, creative thinking, and cross-functional execution. You will work with the global Garena product team in Singapore while representing the Taiwan player community's preferences and culture.

Key Responsibilities
• Plan and execute weekly and monthly in-game event calendars: top-up bonuses, battle pass seasons, limited cosmetic drops, and collaboration events
• Analyze player engagement metrics (DAU, retention curves, conversion funnels) using internal dashboards and SQL queries
• Localize global event content for the Taiwanese market — adapting copy, pricing, and thematic elements
• Manage community feedback channels: monitor LINE official account, Facebook groups, and PTT game boards
• Write and schedule in-game announcements, push notifications, and social media posts
• Coordinate with global product teams in Singapore and regional teams across Southeast Asia

Required Qualifications
• Bachelor's degree in any field — passion and aptitude matter more than major
• Conversational Mandarin Chinese — essential for reading player community posts and communicating with local partners
• Proficient English for collaboration with Singapore HQ
• Analytical mindset: comfortable working with spreadsheets and basic SQL queries
• Strong written communication skills for player-facing content
• Genuine passion for mobile gaming (Free Fire, PUBG Mobile, Genshin Impact, etc.)

Preferred Qualifications
• Prior experience in live ops, community management, or game publishing
• Active Free Fire player with understanding of the game's meta and content cycles
• Experience managing social media channels for gaming or entertainment brands
• Data analysis experience with Amplitude, Mixpanel, or similar product analytics tools`,
  },
  {
    bizName: "Garena Taiwan (Sea Group)",
    title: "Esports Event Coordinator",
    type: "Part-time",
    salary: "180–230 TWD/hour",
    loc: "Garena Esports Hub, Taipei",
    hours: 20,
    visa: true,
    chinese: "Conversational",
    district: "Zhongzheng District, Taipei",
    deadline: "2026-06-01",
    benefits: `Compensation
• Hourly rate: 180–230 TWD
• Event-day bonus for major tournaments
• Free access to all Garena esports events
• Networking with professional esports teams and casters

Flexibility
• Primarily weekday work (20 hrs/week) with occasional weekend event days
• Weekend event days paid at 1.5x rate
• Remote work for administrative tasks`,
    requirements: `About the Role

Garena Taiwan hosts 50+ esports events per year, ranging from online qualifiers for 10,000 players to live stadium broadcasts watched by 500,000 concurrent viewers. As an Esports Event Coordinator (Part-Time), you will support the production and logistics of these events — from online qualifier administration to live event execution.

This is an ideal role for a university student passionate about esports, gaming culture, or event production who wants hands-on experience in Asia's booming esports industry.

What You Will Do
• Manage online qualifier registrations: team enrollment, bracket setup (Battlefy/Challonge), score reporting, and anti-cheat moderation
• Coordinate logistics for live events: venue setup checklists, equipment inventory, vendor communication
• Assist broadcast team during live events: stream monitoring, social media updates, prize pool tracking
• Compile post-event reports: viewership numbers, player feedback, incident logs
• Maintain the Garena Taiwan esports calendar and communicate event schedules to community managers

Required Qualifications
• Currently enrolled at a Taiwanese university (any major)
• Conversational Mandarin (Chinese) for communicating with local vendors, players, and partners
• Proficient English for written communication with Garena Singapore esports team
• Ability to work occasional weekends during major events (compensated)
• Reliable, detail-oriented, and able to stay calm during high-pressure live broadcasts

Preferred Qualifications
• Prior experience organizing gaming tournaments (even at university club level)
• Familiarity with streaming platforms: Twitch, YouTube Live, 17LIVE
• Knowledge of popular esports titles: Free Fire, League of Legends, VALORANT, CS2
• Video editing or social media content creation skills as a bonus`,
  },
  {
    bizName: "Garena Taiwan (Sea Group)",
    title: "Community Manager — SEA Gaming Community",
    type: "Full-time",
    salary: "42,000–55,000 TWD/month",
    loc: "Garena Taiwan, Taipei",
    hours: 40,
    visa: true,
    chinese: "None",
    district: "Da'an District, Taipei",
    deadline: "2026-07-01",
    benefits: `Compensation
• Salary: 42,000–55,000 TWD/month
• Annual bonus based on community KPI achievement
• Sea Group RSU after 1 year
• Remote work: 2 days/week

Gaming Lifestyle
• Unlimited Garena game credits for community research
• Gaming peripherals provided (headset, gaming mouse, mousepad)
• Attend at least 2 international gaming events per year as Garena representative
• Monthly gaming team building with budget`,
    requirements: `About the Role

Garena Taiwan's global community team manages the international (English-speaking) gaming community for Free Fire, which includes players from Southeast Asia, South Asia, the Middle East, and Latin America who follow Garena Taiwan's English content channels. As a Community Manager, you will be the voice of Garena to this diverse global audience.

This is a fully English-medium role — no Mandarin required — making it an excellent fit for international students based in Taiwan who are passionate about gaming and digital communities.

Key Responsibilities
• Manage Garena Taiwan's English-language social media channels: Facebook (1.2M followers), Instagram, Twitter/X, and Discord server
• Create and schedule original content: news posts, meme content, community highlights, event announcements
• Engage with players in comments and DMs, escalating technical issues to the support team
• Scout and onboard content creators (YouTubers, TikTokers, streamers) for the community ambassador program
• Monitor community sentiment and compile monthly community health reports for the product team
• Organize online community events: art contests, prediction challenges, giveaways

Required Qualifications
• Native-level English proficiency (C2) — your entire output is in English, used by millions of readers
• 1+ years of experience managing social media channels or online communities (professional or personal)
• Genuine passion for gaming and deep familiarity with SEA gaming culture and trends
• Creative writing ability: you write posts people actually want to engage with, not corporate announcements
• Comfortable with basic image editing (Canva, Adobe Express, or Photoshop) for social assets

Preferred Qualifications
• Personal gaming content creation (YouTube/TikTok/Twitch) — show us your channel
• Experience managing Discord servers with 10,000+ members
• Knowledge of Free Fire, Mobile Legends, or other SEA mobile gaming titles
• Background in digital marketing, PR, or journalism
• Video editing skills for short-form Reels/Shorts content`,
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SCHOLARSHIPS (full requirements text)
───────────────────────────────────────────────────────────────────────────── */
const SCHOLARSHIPS = [
  {
    name: "MOE Taiwan Scholarship 2026",
    source: "government",
    amount: "40,000 TWD/month stipend + Full Tuition Waiver",
    duration: "2–4 years (degree dependent)",
    coversTuition: true,
    coversDorm: true,
    coversStipend: true,
    minGpa: "3.0/4.0",
    minEnglishReq: "IELTS 6.0 / TOEFL iBT 80 / TOEIC 750",
    eligibleDegrees: ["Bachelor", "Master", "PhD"],
    eligibleCountries: ["Vietnam", "Indonesia", "Malaysia", "Thailand", "Philippines", "India", "Myanmar", "Cambodia", "All ASEAN"],
    deadline: "2026-03-31",
    applicationUrl: "https://scholarship.moe.gov.tw",
    isActive: true,
    requirements: `Overview
The Ministry of Education (MOE) Taiwan Scholarship is the flagship government-funded scholarship for international students pursuing full degree programs in Taiwan. It is widely regarded as one of Asia's most generous study abroad packages, covering full tuition, a generous monthly stipend, and dormitory subsidy.

In 2025, MOE awarded 1,800 scholarships to students from 62 countries. Competition is significant — typically 8–12 applicants per available slot for top universities and programs.

What the Scholarship Covers
• Full tuition waiver for the duration of your degree program
• Monthly living stipend: 15,000 TWD (Bachelor), 20,000 TWD (Master), 40,000 TWD (PhD)
• Dormitory fee subsidy up to 8,000 TWD/month at on-campus residences
• One-time arrival allowance: 20,000 TWD
• Round-trip economy airfare reimbursement (once per academic year)

Eligibility Requirements
• Citizen of a country with diplomatic or informal ties with Taiwan — includes most ASEAN nations, South Asia, Central America, Pacific Islands, and others
• Age 40 or below at time of application
• Not holding any other government-funded scholarship simultaneously
• High school GPA (Bachelor applicants): minimum 70/100 or equivalent
• Undergraduate GPA (Master/PhD applicants): minimum 3.0/4.0 or 75%
• English proficiency: IELTS 6.0, TOEFL iBT 80, or TOEIC 750 minimum
• Cannot have previously received the MOE scholarship

Required Documents
• Official academic transcripts (notarized and Chinese/English translated)
• English or Chinese language proficiency certificate
• Research proposal (Master/PhD applicants): 2,000–3,000 words
• Personal statement: why Taiwan, why this program, what you will contribute
• Minimum 2 letters of recommendation (at least 1 from current/most recent academic supervisor)
• Copy of valid passport
• Health certificate from a licensed physician
• Optional but strongly recommended: Letter of acceptance or intent from a professor at your target university

Selection Process
Applications are first evaluated at Taiwan's MOFA representative office in your home country (e.g., TECRO, TECO). Shortlisted candidates attend an interview panel conducted in English, typically in March–May. Final results are announced by June. University enrollment follows in August/September.

Important Notes
• You must apply to a specific university's program simultaneously — the scholarship does not guarantee admission independently
• Contact your target professor before the application deadline — faculty endorsement significantly increases selection odds
• Maintain GPA above 3.0 each semester for renewal; failure to meet this results in scholarship suspension`,
  },
  {
    name: "ICDF International Higher Education Scholarship",
    source: "government",
    amount: "25,000 TWD/month + Round-trip Airfare + Tuition",
    duration: "1–4 years",
    coversTuition: true,
    coversDorm: false,
    coversStipend: true,
    minGpa: "3.0/4.0",
    minEnglishReq: "IELTS 5.5 or equivalent",
    eligibleDegrees: ["Bachelor", "Master", "PhD"],
    eligibleCountries: ["Vietnam", "Indonesia", "Philippines", "Belize", "Guatemala", "Honduras", "Paraguay", "Marshall Islands", "All ICDF partner countries"],
    deadline: "2026-03-15",
    applicationUrl: "https://www.icdf.org.tw/scholarship",
    isActive: true,
    requirements: `Overview
The International Cooperation and Development Fund (Taiwan ICDF) Higher Education Scholarship supports students from Taiwan's partner developing nations in pursuing full degree programs at designated Taiwanese universities. Unlike the MOE scholarship, ICDF places a strong emphasis on development-oriented fields and applicants with ties to public service.

ICDF partners with approximately 30 universities in Taiwan across 52 designated study programs. Students must apply to one of these specific programs — ICDF does not fund admission to arbitrary programs.

Coverage
• Full tuition and required fees at the designated institution
• Monthly living allowance: 25,000 TWD (all degree levels)
• Round-trip economy airfare: 1 trip per academic year
• Group health insurance for the scholarship period
• One-time settlement allowance upon arrival: 10,000 TWD

Target Fields (Higher Priority in 2026)
• Agriculture and sustainable food systems
• Public health and tropical medicine
• Environmental engineering and water resource management
• Information and communication technology for development
• Business administration and trade policy
• Aquaculture and fisheries management

Eligibility Requirements
• National of an ICDF partner country (check official list at icdf.org.tw)
• Under 40 years of age at time of application
• Minimum GPA: 3.0/4.0 (Master/PhD) or 70% average (Bachelor)
• English proficiency: IELTS 5.5, TOEFL iBT 69, or equivalent
• Ideally: background in public service, government, NGO, or development-related work
• Commitment to return to home country after degree completion (signed agreement required)

Application Route
ICDF scholarships must be applied through your home country's government or a designated ICDF partner organization. Most applicants apply via their Ministry of Education or a public university's international office that maintains an ICDF partnership.

Documents Required
• Completed ICDF online application form
• Official transcripts (translated to English or Chinese)
• Language proficiency scores
• Statement of purpose (development focus — describe how your studies will benefit your home country)
• 2 recommendation letters
• Government employment certificate (if applicable)
• Return commitment letter

2026 Available Programs (Selected)
• NTU: Tropical Medicine Master's, Environmental Engineering PhD
• NCKU: Hydraulic & Ocean Engineering Master's, Architecture Master's
• NCHU: Plant Pathology Master's, Agronomy Master's
• NTUST: Industrial Engineering Master's, Civil Engineering Master's`,
  },
  {
    name: "Huayu Enrichment Scholarship (HES) 2026",
    source: "government",
    amount: "25,000 TWD/month living stipend",
    duration: "3 months, 6 months, or 12 months",
    coversTuition: false,
    coversDorm: false,
    coversStipend: true,
    minGpa: null,
    minEnglishReq: null,
    minChineseReq: "Basic Mandarin preferred but not required",
    eligibleDegrees: ["Bachelor", "Master", "PhD"],
    eligibleCountries: ["All countries"],
    deadline: "2026-04-30",
    applicationUrl: "https://www.studyintaiwan.org/scholarship/hs",
    isActive: true,
    requirements: `Overview
The Huayu Enrichment Scholarship (HES), officially named the 華語文獎學金, is awarded by Taiwan's Ministry of Education to international students who wish to study Mandarin Chinese at a language center attached to a Taiwanese university. Unlike degree scholarships, HES is designed specifically for language learning — no degree enrollment is required.

HES is one of the most accessible Taiwan government scholarships, open to students from virtually all countries and with no GPA or language score requirements. Selection is based primarily on motivation and commitment to Mandarin language learning.

Coverage
• Monthly stipend: 25,000 TWD (sufficient to cover living expenses in most Taiwanese cities)
• Duration options: 3 months (one semester), 6 months (academic year), or 12 months (two semesters)
• The scholarship does NOT cover tuition (language center fees typically 30,000–50,000 TWD/semester — paid separately)
• Health insurance enrollment assistance provided by the language center

Eligible Applicants
• Citizens of any country (no diplomatic restriction)
• Age 18–40 at time of application
• Must NOT be enrolled in a degree program simultaneously
• Must NOT have previously received HES for more than 12 months total
• No prior Mandarin study required — beginners welcome and encouraged

Participating Language Centers (Selected)
Mandarin Training Center (MTC) at NTNU, Chinese Language Division at NTU, NCKU Mandarin Studies Center, NTHU Chinese Language Center, and 20+ other university-affiliated language centers nationwide.

Application Process
1. Choose a language center and apply for enrollment (independent of scholarship)
2. Obtain a language center acceptance letter
3. Submit HES scholarship application through MOFA representative office in your country
4. Interview (conducted by phone or video, approximately 15 minutes, in English or Mandarin)
5. Results announced approximately 6–8 weeks before program start

What You Need to Apply
• Valid passport copy
• Acceptance letter from a recognized Mandarin language center in Taiwan
• Short essay (500–800 words): "Why do you want to study Mandarin in Taiwan, and how will it benefit your future?"
• 1 letter of recommendation (from employer, professor, or community leader)
• Government ID copy
• 2 passport-size photos

Pro Tip: HES is a common "entry point" for students planning to later apply for degree scholarships. Many students use HES to learn Mandarin, establish connections with professors, and strengthen future graduate school applications to NTU, NTHU, or NCKU.`,
  },
  {
    name: "NTU International Excellence Award 2026",
    source: "school_based",
    amount: "50–100% Tuition Waiver per semester",
    duration: "Full degree program (renewable annually)",
    coversTuition: true,
    coversDorm: false,
    coversStipend: false,
    minGpa: "3.5/4.0",
    minEnglishReq: "IELTS 7.0 / TOEFL iBT 100",
    eligibleDegrees: ["Master", "PhD"],
    eligibleCountries: ["All countries"],
    deadline: "2026-03-20",
    applicationUrl: "https://oia.ntu.edu.tw/scholarships",
    isActive: true,
    requirements: `Overview
The NTU International Excellence Award is NTU's premier merit scholarship for outstanding incoming international graduate students. Unlike most scholarships that require a separate application, this award uses your admission application as the basis for consideration — no extra application form is needed.

The scholarship was established to attract the world's best graduate students to NTU and currently supports approximately 300–400 students per intake year.

Scholarship Levels
• Full Award (100% tuition waiver): Reserved for the top 5% of applicants per department — typically students with GPAs of 3.8+, IELTS 7.5+, and strong research publication records
• Partial Award (50% tuition waiver): Awarded to approximately 15% of admitted international students with strong overall profiles
• Duration: Each semester renewal depends on maintaining the required academic standing

Eligibility
• Must be admitted to an NTU Master's or PhD degree program (award does not apply to exchange students)
• Minimum undergraduate GPA: 3.5/4.0 (exceptions for exceptional research background)
• English proficiency: IELTS 7.0 or TOEFL iBT 100 minimum (higher scores strengthen application)
• Strong statement of purpose demonstrating clear research direction
• At least 2 strong letters of recommendation from academic supervisors or professors

What Strengthens Your Application
• Prior research experience with published or submitted papers (strongest differentiator)
• Email correspondence with an NTU faculty member willing to supervise you
• Clear alignment between your research interests and current NTU faculty projects
• International academic competition awards or honors
• Work or research experience at a recognized institution

How Awards Are Decided
Each NTU department's Graduate Admissions Committee reviews all international applicants and nominates candidates for the Excellence Award. The Office of International Affairs (OIA) coordinates final award allocations. Department-specific factors vary — CSIE (CS) places heavy emphasis on research fit, while Global MBA prioritizes GMAT scores and work experience.

Renewal Conditions
• Maintain semester GPA above 3.3/4.0 (Full Award) or 3.0/4.0 (Partial Award)
• Remain enrolled full-time
• No disciplinary records
• Required to submit a one-page annual progress report to OIA`,
  },
  {
    name: "NCKU Distinguished International Student Scholarship",
    source: "school_based",
    amount: "250,000 TWD total (125,000 TWD/year for 2-year Master's)",
    duration: "2 years (Master's degree)",
    coversTuition: true,
    coversDorm: true,
    coversStipend: false,
    minGpa: "3.3/4.0",
    minEnglishReq: "IELTS 6.0 / TOEFL iBT 79",
    eligibleDegrees: ["Master"],
    eligibleCountries: ["All countries"],
    deadline: "2026-04-10",
    applicationUrl: "https://oia.ncku.edu.tw/scholarship",
    isActive: true,
    requirements: `Overview
The NCKU Distinguished International Student Scholarship is awarded to the top-performing international applicants to NCKU's English-taught Master's programs. It is one of the most financially significant school-based scholarships in Southern Taiwan, combining tuition coverage with dormitory fee support.

Approximately 80–100 awards are given per intake year across all participating departments. Engineering, Science, and Technology programs receive the largest allocations.

Award Value Breakdown
• Year 1: Tuition waiver (~62,000 TWD/semester × 2) + Dormitory subsidy (up to 6,000 TWD/month × 12) = ~196,000 TWD
• Year 2: Same structure, contingent on GPA maintenance
• Total value over 2 years: approximately 250,000–300,000 TWD depending on department tuition rates

Eligible Programs (2026 intake, selected)
• Semiconductor and Electrophysics Engineering
• Electrical Engineering
• Mechanical Engineering
• Civil and Environmental Engineering
• Computer Science and Information Engineering
• Business Administration (English-taught cohort)
• Architecture and Urban Design

Eligibility Requirements
• Applying to one of NCKU's designated English-taught Master's programs
• Undergraduate GPA: minimum 3.3/4.0 or 80% average from a recognized institution
• English proficiency: IELTS 6.0, TOEFL iBT 79, or TOEIC 750
• Strong statement of purpose demonstrating academic motivation and research interest
• Minimum 2 letters of recommendation
• Priority given to students in top 20% of their undergraduate class

Application Instructions
There is NO separate scholarship application form. Your admission application to NCKU's English-taught Master's program is simultaneously evaluated for the scholarship. Indicate on your application form that you wish to be considered for the Distinguished International Student Scholarship.

The NCKU Office of International Affairs (OIA) contacts shortlisted scholarship recipients after the admissions committee review — typically in May for September enrollment.

Scholarship Renewal
• Minimum semester GPA: 3.0/4.0 to maintain scholarship for Year 2
• Full-time enrollment required (minimum 9 credits/semester)
• Students who fail to meet renewal criteria may apply for the reduced Partial Support Award (50% tuition waiver)`,
  },
  {
    name: "NTHU Outstanding International Student Award",
    source: "school_based",
    amount: "Full Tuition + 15,000 TWD/month living allowance",
    duration: "2 years (Master) / 4 years (PhD)",
    coversTuition: true,
    coversDorm: true,
    coversStipend: true,
    minGpa: "3.5/4.0",
    minEnglishReq: "IELTS 6.5 / TOEFL iBT 90",
    eligibleDegrees: ["Master", "PhD"],
    eligibleCountries: ["ASEAN", "South Asia", "East Africa", "All developing nations"],
    deadline: "2026-03-31",
    applicationUrl: "https://oia.nthu.edu.tw",
    isActive: true,
    requirements: `Overview
The NTHU Outstanding International Student Award is among the most prestigious and comprehensive scholarships available from a Taiwanese university, combining full tuition coverage, dormitory support, and a meaningful monthly living allowance. It is designed to recruit the very best STEM talent from developing nations to NTHU's world-class research programs in Hsinchu.

Approximately 40–60 awards are made per intake year. Competition is extremely high — most recipients rank in the top 5% of their undergraduate class and have significant research experience.

Full Coverage Details
• 100% tuition waiver for the full degree program (2 years Master / 4 years PhD)
• University dormitory fee waiver (valued at approximately 5,500–7,000 TWD/month)
• Monthly living allowance: 15,000 TWD/month (provided 12 months/year)
• One-time settlement allowance: 15,000 TWD upon arrival
• Total estimated value over a 2-year Master's: approximately 600,000–700,000 TWD

Priority Research Areas (2026)
• Semiconductor materials and devices
• Applied AI and machine learning systems
• Quantum computing and photonics
• Sustainable energy and environmental engineering
• Biomedical engineering and precision medicine

Eligibility
• Bachelor's degree from a recognized university with GPA of 3.5/4.0 or above
• English proficiency: IELTS 6.5 or TOEFL iBT 90 minimum
• National of an ASEAN country, South Asian country, East African country, or other developing nation listed in NTHU's eligibility roster
• Strong preference for applicants with demonstrated research output: papers, conference presentations, patents, or significant thesis projects
• A faculty member at NTHU willing to supervise your research is essential — contact professors before applying

What Makes a Strong Application
• Identification and pre-contact of a specific NTHU professor whose current research aligns with your background
• A research proposal (3,000–5,000 words) that is genuinely specific, not generic
• Academic publications at indexed journals or conferences (even under review counts)
• GPA in the top 5–10% of your class
• Strong, specific letters of recommendation from supervisors who can speak to research capability

Application Timeline
• January 10: Application portal opens
• March 31: Application deadline (all materials must be submitted by 11:59pm Taiwan time)
• April–May: Department committee review and shortlisting
• May–June: OIA scholarship committee final decisions
• June: Award notifications sent
• September: Academic enrollment begins`,
  },
  {
    name: "FCU International Student Grant 2026",
    source: "school_based",
    amount: "30–50% Annual Tuition Reduction",
    duration: "Full degree program (renewable each semester)",
    coversTuition: true,
    coversDorm: false,
    coversStipend: false,
    minGpa: "2.8/4.0",
    minEnglishReq: "IELTS 5.5 / TOEFL iBT 70 / TOEIC 600",
    eligibleDegrees: ["Bachelor", "Master"],
    eligibleCountries: ["All countries"],
    deadline: "2026-03-15",
    applicationUrl: "https://ic.fcu.edu.tw/scholarship",
    isActive: true,
    requirements: `Overview
The Feng Chia University International Student Grant is automatically considered for all applicants to FCU's International College. It is one of the most accessible scholarships in Taiwan, with significantly lower eligibility thresholds than government or other university scholarships — designed to make quality international education in Taiwan affordable for students from all backgrounds.

FCU awarded International Student Grants to over 60% of its incoming international students in 2025.

Award Tiers (2026 Academic Year)
• Tier A — 50% tuition reduction: GPA 3.5+, IELTS 6.5+, outstanding application
• Tier B — 40% tuition reduction: GPA 3.0–3.49, IELTS 6.0–6.49, strong application
• Tier C — 30% tuition reduction: GPA 2.8–2.99, IELTS 5.5–5.99, qualified application
• Duration: Renewable each semester with GPA maintenance above 2.8/4.0

What the Grant Covers
• 30–50% reduction on annual tuition fees
• For reference: FCU International College tuition is approximately 76,000–92,000 TWD/year depending on program
• A Tier A grant for a Master's program saves approximately 40,000–46,000 TWD per year

Application Process
No separate scholarship application is needed. When you submit your FCU International College admission application:
1. Complete the International Student Grant section in the online application portal
2. Upload your academic transcripts and language score certificate
3. FCU's admissions committee evaluates your application and assigns your grant tier within 4–6 weeks
4. Your official acceptance letter will state the grant amount you have been awarded

Eligible Programs in FCU International College
• International Business Administration (BBA and MBA)
• Information Engineering and Computer Science
• Data Science and Artificial Intelligence
• Finance and Economics
• Industrial Engineering and Systems Management
• Architecture and Urban Design
• Graduate Institute of Science and Technology

Renewal Requirements
• Maintain semester GPA above 2.8/4.0
• Complete minimum credit load each semester (typically 9–12 credits depending on program)
• No academic misconduct or disciplinary issues
• Submit renewal application form to International College office before each semester deadline (mid-semester)

Additional Financial Support Available
• FCU Work-Study Program: on-campus part-time positions (180–200 TWD/hour) available to grant recipients
• Emergency financial assistance fund for students facing unexpected hardships`,
  },
  {
    name: "Taiwan STEM Excellence Fellowship 2026",
    source: "private",
    amount: "Full tuition + dormitory + 20,000 TWD/month stipend (Total ~600,000 TWD)",
    duration: "2 years (Master's degree)",
    coversTuition: true,
    coversDorm: true,
    coversStipend: true,
    minGpa: "3.7/4.0",
    minEnglishReq: "IELTS 7.0 / TOEFL iBT 100",
    eligibleDegrees: ["Master", "PhD"],
    eligibleCountries: ["Vietnam", "Indonesia", "Thailand", "Malaysia", "Singapore", "India", "Bangladesh"],
    deadline: "2026-02-28",
    applicationUrl: "https://www.studyintaiwan.org",
    isActive: true,
    requirements: `Overview
The Taiwan STEM Excellence Fellowship is a privately funded scholarship established by the Taiwan STEM Foundation — a consortium of Taiwan's leading technology companies including TSMC, MediaTek, Delta Electronics, and Foxconn — to attract exceptional STEM talent from South and Southeast Asia to Taiwan's research universities.

This is Taiwan's most generous privately funded scholarship, offering a total package comparable to the MOE Scholarship but with an additional industrial internship component that provides unmatched industry exposure.

Full Fellowship Package
• 100% tuition waiver at one of 5 eligible universities (NTU, NTHU, NCKU, NYCU, NTUST)
• Monthly living stipend: 20,000 TWD for 24 months
• University dormitory fees fully covered
• One-time arrival allowance: 25,000 TWD
• Round-trip economy airfare: 1 trip per year
• Mandatory 3-month industry internship at a TSMC Foundation member company (paid additionally at market rate: ~35,000–45,000 TWD/month during internship)
• Total estimated value: 580,000–680,000 TWD over 2 years (excluding internship income)

Eligible Fields of Study (2026)
Applications must be for programs in one of the following fields at a designated university:
• Electrical Engineering (EE) — all specializations
• Computer Science and Information Engineering (CSIE)
• Materials Science and Engineering
• Chemical Engineering
• Mechanical Engineering (with semiconductor focus)
• Applied Physics (semiconductor devices specialization)

Strict Eligibility Requirements
This is a highly competitive fellowship. Only 30 awards are made annually across all eligible countries.

Academic Requirements:
• GPA: 3.7/4.0 or above (Class rank top 5% preferred)
• English: IELTS 7.0 or TOEFL iBT 100 minimum
• Must have a Bachelor's degree in a directly related STEM field

Research Requirements:
• At least 1 published or accepted paper at an indexed journal or international conference (IEEE, ACM, Elsevier, etc.) — OR significant research thesis with external evaluation
• Clearly stated research proposal (4,000–6,000 words) with specific relevance to Taiwan's semiconductor or tech industry

Commitment:
• Agreement to complete the 3-month industry internship at a designated company
• While no return service is mandatory, fellows are strongly encouraged to consider careers in Taiwan's tech industry upon graduation

Application Materials
• Completed Taiwan STEM Foundation online application form
• Official transcripts with class rank certification
• IELTS/TOEFL scores (must be from tests taken within the last 2 years)
• Research proposal (template provided on foundation website)
• 3 letters of recommendation: at least 2 from academic supervisors who can directly assess research ability
• List of publications, projects, or patents
• 5-minute video introduction (recorded and submitted — evaluated for communication skills)
• University admission letter or evidence of application to one of 5 eligible universities

Selection Process
• February 28: Application deadline
• March: Initial screening by Taiwan STEM Foundation panel
• April: Finalist interviews (video call with 3-person panel including 1 industry representative)
• May: Award notifications
• June: Internship placement matching
• September: University enrollment begins`,
  },
];

export async function seedContentData() {
  const { databases } = await createAdminClient();

  try {
    console.log("🌱 Seeding rich content data...");

    // ── JOBS ──────────────────────────────────────────────────────────────
    console.log("Seeding jobs...");
    for (const j of JOBS) {
      try {
        const bizDocs = await databases.listDocuments(DB_ID, "Businesses", [
          Query.equal("companyName", j.bizName),
        ]);
        if (bizDocs.total === 0) { console.warn(`Business not found: ${j.bizName}`); continue; }
        const bizId = bizDocs.documents[0].$id;

        const ex = await databases.listDocuments(DB_ID, "Jobs", [
          Query.equal("businessId", bizId),
          Query.equal("title", j.title),
        ]);
        if (ex.total > 0) continue;

        await databases.createDocument(DB_ID, "Jobs", ID.unique(), {
          businessId: bizId,
          title: j.title,
          jobType: j.type,
          salaryRange: j.salary,
          location: j.loc,
          hoursPerWeek: j.hours,
          allowsStudentVisa: j.visa,
          chineseRequired: j.chinese,
          district: j.district,
          benefits: j.benefits,
          requirements: j.requirements,
          deadline: j.deadline,
          isActive: true,
        });
        console.log(`  ✓ Job: ${j.title}`);
      } catch (e) { console.error(`Job error (${j.title}):`, e); }
    }

    // ── SCHOLARSHIPS ──────────────────────────────────────────────────────
    console.log("Seeding scholarships...");
    for (const s of SCHOLARSHIPS) {
      try {
        const ex = await databases.listDocuments(DB_ID, "Scholarships", [
          Query.equal("name", s.name),
        ]);
        if (ex.total > 0) continue;

        // Find schoolId if school_based
        let schoolId: string | undefined;
        if (s.source === "school_based") {
          const exactName = s.name.includes("NTU") ? "National Taiwan University (NTU)"
            : s.name.includes("NCKU") ? "National Cheng Kung University (NCKU)"
            : s.name.includes("NTHU") ? "National Tsing Hua University (NTHU)"
            : s.name.includes("FCU") ? "Feng Chia University (FCU)"
            : null;
          if (exactName) {
            const schoolDocs = await databases.listDocuments(DB_ID, "Schools", [
              Query.equal("schoolName", exactName),
            ]);
            if (schoolDocs.total > 0) schoolId = schoolDocs.documents[0].$id;
          }
        }

        await databases.createDocument(DB_ID, "Scholarships", ID.unique(), {
          name: s.name,
          source: s.source,
          schoolId: schoolId ?? undefined,
          amount: s.amount,
          duration: s.duration,
          coversTuition: s.coversTuition,
          coversDorm: s.coversDorm,
          coversStipend: s.coversStipend,
          minGpa: s.minGpa ?? undefined,
          minEnglishReq: s.minEnglishReq ?? undefined,
          minChineseReq: (s as any).minChineseReq ?? undefined,
          eligibleDegrees: s.eligibleDegrees,
          eligibleCountries: s.eligibleCountries,
          requirements: s.requirements,
          deadline: s.deadline,
          applicationUrl: s.applicationUrl,
          isActive: s.isActive,
        });
        console.log(`  ✓ Scholarship: ${s.name}`);
      } catch (e) { console.error(`Scholarship error (${s.name}):`, e); }
    }

    revalidatePath("/jobs");
    revalidatePath("/scholarships");
    revalidatePath("/");

    console.log("✅ Content seeding complete!");
    return { success: true };
  } catch (error) {
    console.error("❌ Content seeding failed:", error);
    return { success: false, error: String(error) };
  }
}
