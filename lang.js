// Language Configuration for ExcelLearn Tuition Center

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
        this.translations = {};
        this.init();
    }

    async init() {
        // Load translations
        await this.loadTranslations();
        
        // Set initial language
        await this.setLanguage(this.currentLang);
        
        // Setup language switcher
        this.setupLanguageSwitcher();
    }

    async loadTranslations() {
        try {
            // Load English translations
            const enResponse = await fetch('translations/en.json');
            this.translations.en = await enResponse.json();
            
            // Load Malay translations
            const msResponse = await fetch('translations/ms.json');
            this.translations.ms = await msResponse.json();
            
            console.log('Translations loaded successfully');
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to embedded translations
            this.translations = {
                en: this.getFallbackEN(),
                ms: this.getFallbackMS()
            };
        }
    }

    async setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        // Update language switcher
        const languageSwitch = document.getElementById('languageSwitch');
        if (languageSwitch) {
            languageSwitch.value = lang;
        }
        
        // Apply translations
        this.applyTranslations();
        
        // Update form placeholders and options
        this.updateFormElements();
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
        
        console.log(`Language changed to: ${lang}`);
    }

    applyTranslations() {
        const translations = this.translations[this.currentLang];
        
        // Translate elements with data-lang attribute
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            const translation = this.getNestedValue(translations, key);
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translation;
                } else if (element.hasAttribute('title')) {
                    element.title = translation;
                } else if (element.hasAttribute('alt')) {
                    element.alt = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Translate title tag
        const titleElement = document.querySelector('title[data-lang]');
        if (titleElement) {
            const titleKey = titleElement.getAttribute('data-lang');
            const titleTranslation = this.getNestedValue(translations, titleKey);
            if (titleTranslation) {
                document.title = titleTranslation;
            }
        }
        
        // Translate meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && translations.meta?.description) {
            metaDescription.content = translations.meta.description;
        }
    }

    updateFormElements() {
        // Update select options that have data-lang attributes
        document.querySelectorAll('select option[data-lang]').forEach(option => {
            const key = option.getAttribute('data-lang');
            const translation = this.getNestedValue(this.translations[this.currentLang], key);
            if (translation) {
                option.textContent = translation;
            }
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((o, p) => (o ? o[p] : null), obj);
    }

    setupLanguageSwitcher() {
        const languageSwitch = document.getElementById('languageSwitch');
        if (languageSwitch) {
            languageSwitch.value = this.currentLang;
            languageSwitch.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    // Fallback translations in case JSON files fail to load
    getFallbackEN() {
        return {
            title: "ExcelLearn Tuition Center | Online & Offline Secondary School Tutoring",
            meta: {
                description: "Expert online and offline tutoring for secondary school students. Master all subjects with personalized learning from certified teachers."
            },
            nav: {
                home: "Home",
                about: "About",
                subjects: "Subjects",
                pricing: "Pricing",
                testimonials: "Testimonials",
                contact: "Contact",
                login: "Login"
            },
            hero: {
                title: "Excel in All Subjects with Expert Secondary School Tuition",
                subtitle: "Personalized online and offline tutoring designed to boost grades, build confidence, and achieve academic excellence for secondary school students.",
                trial: "Start Free Trial Class",
                pricing: "View Pricing Plans",
                stats: {
                    students: "Students Excelling",
                    success: "Exam Success Rate",
                    tutors: "Certified Tutors",
                    support: "Learning Support"
                }
            },
            about: {
                title: "Why Choose ExcelLearn Tuition Center?",
                description: "We provide comprehensive secondary school education support through both online and offline platforms, ensuring flexibility and quality learning.",
                features: {
                    tutors: {
                        title: "Expert Certified Tutors",
                        desc: "All our tutors are qualified educators with extensive experience teaching secondary school curriculum."
                    },
                    flexible: {
                        title: "Flexible Learning Modes",
                        desc: "Choose between interactive online sessions or traditional classroom-based learning - whatever suits you best."
                    },
                    subjects: {
                        title: "All Subjects Covered",
                        desc: "Mathematics, Science, English, History, Geography, Languages - we cover the complete secondary curriculum."
                    },
                    tracking: {
                        title: "Personalized Progress Tracking",
                        desc: "Regular assessments and progress reports to ensure continuous improvement and goal achievement."
                    }
                }
            },
            subjects: {
                title: "Comprehensive Subject Coverage",
                description: "We offer expert tutoring for all secondary school subjects from Form 1 to Form 5 (SPM)",
                math: "Mathematics",
                "math.desc": "Algebra, Calculus, Geometry, Statistics, Additional Mathematics",
                science: "Science",
                "science.desc": "Physics, Chemistry, Biology, General Science, Applied Science",
                languages: "Languages",
                "languages.desc": "English, Malay, Chinese, Tamil, Arabic, French",
                humanities: "Humanities",
                "humanities.desc": "History, Geography, Islamic Studies, Moral Studies, Economics",
                technical: "Technical",
                "technical.desc": "ICT, Computer Science, Engineering, Technical Drawing",
                exam: "Exam Preparation",
                "exam.desc": "SPM, PT3, IGCSE, O-Levels, Trial Exam Special Sessions"
            },
            pricing: {
                title: "Affordable Tuition Plans",
                description: "Choose the perfect learning package for your academic needs and budget",
                permonth: "/month",
                popular: "Most Popular",
                choose: "Choose Plan",
                plans: {
                    basic: {
                        name: "Basic",
                        feature1: "4 Group Classes Monthly",
                        feature2: "1 Subject Choice",
                        feature3: "Online Access Only",
                        feature4: "No Personal Tutor",
                        feature5: "Limited Assessments"
                    },
                    standard: {
                        name: "Standard",
                        feature1: "8 Group Classes Monthly",
                        feature2: "3 Subject Choices",
                        feature3: "Online & Offline Access",
                        feature4: "Weekly Progress Report",
                        feature5: "Limited 1-on-1 Sessions"
                    },
                    premium: {
                        name: "Premium",
                        feature1: "Unlimited Classes",
                        feature2: "All Subjects Access",
                        feature3: "Dedicated Personal Tutor",
                        feature4: "Daily Progress Tracking",
                        feature5: "Exam Crash Courses"
                    }
                }
            },
            enroll: {
                title: "Enroll Today & Start Your Learning Journey",
                description: "Fill out the form below to register for a free trial class or enroll in our tuition programs",
                form: {
                    studentName: "Student's Full Name *",
                    parentName: "Parent/Guardian Name *",
                    email: "Email Address *",
                    phone: "Phone Number *",
                    grade: "Current Grade/Form *",
                    selectGrade: "Select Grade",
                    form1: "Form 1",
                    form2: "Form 2",
                    form3: "Form 3",
                    form4: "Form 4",
                    form5: "Form 5",
                    subjects: "Subjects Needed *",
                    math: "Mathematics",
                    science: "Science",
                    english: "English",
                    malay: "Malay Language",
                    history: "History",
                    geography: "Geography",
                    physics: "Physics",
                    chemistry: "Chemistry",
                    biology: "Biology",
                    addmath: "Additional Mathematics",
                    selectMultiple: "Hold Ctrl/Cmd to select multiple subjects",
                    learningMode: "Preferred Learning Mode *",
                    selectMode: "Select Mode",
                    online: "Online Only",
                    offline: "Offline Only",
                    both: "Both Online & Offline",
                    plan: "Preferred Plan *",
                    selectPlan: "Select Plan",
                    trial: "Free Trial Class Only",
                    notes: "Additional Notes or Requirements",
                    consent: "I agree to receive information about classes, schedules, and educational materials via email or phone.",
                    submit: "Submit Enrollment Form"
                },
                payment: {
                    title: "Secure Payment Options",
                    description: "After submission, you'll be redirected to our secure payment gateway",
                    toyibpay: "Pay with ToyyibPay"
                }
            },
            testimonials: {
                title: "Success Stories from Our Students",
                description: "Hear from students and parents who have achieved academic excellence with ExcelLearn",
                1: {
                    text: "\"My daughter's Mathematics grade improved from C to A in just 3 months. The personalized attention and regular assessments made all the difference!\"",
                    author: "Parent of Form 3 Student",
                    location: "Kuala Lumpur"
                },
                2: {
                    text: "\"The online classes are so interactive and engaging. I can learn at my own pace and the tutors are always available to answer my questions.\"",
                    author: "Form 5 Science Student",
                    location: "Penang"
                },
                3: {
                    text: "\"ExcelLearn's comprehensive approach to SPM preparation helped me score 8A's. The exam-focused strategies and mock tests were invaluable.\"",
                    author: "SPM 2023 Graduate",
                    location: "Johor Bahru"
                }
            },
            contact: {
                title: "Contact ExcelLearn Tuition Center",
                description: "Have questions? We're here to help you with your educational journey.",
                visit: "Visit Our Center",
                call: "Call Us",
                hours: "Mon-Fri: 9am-6pm, Sat: 9am-1pm",
                email: "Email Us",
                form: {
                    title: "Send us a Message",
                    name: "Your Name",
                    email: "Your Email",
                    subject: "Subject",
                    message: "Your Message",
                    submit: "Send Message"
                }
            },
            footer: {
                about: {
                    title: "ExcelLearn Tuition",
                    description: "Providing quality secondary school education through personalized online and offline tutoring since 2015."
                },
                links: {
                    title: "Quick Links"
                },
                legal: {
                    title: "Legal",
                    privacy: "Privacy Policy",
                    terms: "Terms of Service",
                    refund: "Refund Policy",
                    faq: "FAQ"
                },
                newsletter: {
                    title: "Subscribe to Newsletter",
                    placeholder: "Your Email",
                    subscribe: "Subscribe"
                },
                rights: "All Rights Reserved",
                accredited: "MQA Accredited Institution"
            }
        };
    }

    getFallbackMS() {
        return {
            title: "ExcelLearn Pusat Tuisyen | Tuisyen Dalam Talian & Luar Talian untuk Sekolah Menengah",
            meta: {
                description: "Tuisyen dalam talian dan luar talian pakar untuk pelajar sekolah menengah. Kuasai semua subjek dengan pembelajaran peribadi daripada guru bertauliah."
            },
            nav: {
                home: "Laman Utama",
                about: "Tentang Kami",
                subjects: "Subjek",
                pricing: "Harga",
                testimonials: "Testimoni",
                contact: "Hubungi",
                login: "Log Masuk"
            },
            hero: {
                title: "Cemerlang dalam Semua Subjek dengan Tuisyen Sekolah Menengah Pakar",
                subtitle: "Tuisyen dalam talian dan luar talian yang diperibadikan direka untuk meningkatkan gred, membina keyakinan, dan mencapai kecemerlangan akademik untuk pelajar sekolah menengah.",
                trial: "Mulakan Kelas Percubaan Percuma",
                pricing: "Lihat Pelan Harga",
                stats: {
                    students: "Pelajar Cemerlang",
                    success: "Kadar Kejayaan Peperiksaan",
                    tutors: "Tutor Bertauliah",
                    support: "Sokongan Pembelajaran"
                }
            },
            about: {
                title: "Mengapa Pilih ExcelLearn Pusat Tuisyen?",
                description: "Kami menyediakan sokongan pendidikan sekolah menengah yang komprehensif melalui platform dalam talian dan luar talian, memastikan fleksibiliti dan pembelajaran berkualiti.",
                features: {
                    tutors: {
                        title: "Tutor Bertauliah Pakar",
                        desc: "Semua tutor kami adalah pendidik yang berkelayakan dengan pengalaman luas mengajar kurikulum sekolah menengah."
                    },
                    flexible: {
                        title: "Mod Pembelajaran Fleksibel",
                        desc: "Pilih antara sesi dalam talian interaktif atau pembelajaran berasaskan bilik darjah tradisional - mengikut kesesuaian anda."
                    },
                    subjects: {
                        title: "Semua Subjek Diliputi",
                        desc: "Matematik, Sains, Bahasa Inggeris, Sejarah, Geografi, Bahasa - kami meliputi kurikulum menengah yang lengkap."
                    },
                    tracking: {
                        title: "Penjejakan Kemajuan Peribadi",
                        desc: "Penilaian berkala dan laporan kemajuan untuk memastikan peningkatan berterusan dan pencapaian matlamat."
                    }
                }
            },
            subjects: {
                title: "Liputan Subjek Komprehensif",
                description: "Kami menawarkan tuisyen pakar untuk semua subjek sekolah menengah dari Tingkatan 1 hingga Tingkatan 5 (SPM)",
                math: "Matematik",
                "math.desc": "Algebra, Kalkulus, Geometri, Statistik, Matematik Tambahan",
                science: "Sains",
                "science.desc": "Fizik, Kimia, Biologi, Sains Am, Sains Gunaan",
                languages: "Bahasa",
                "languages.desc": "Bahasa Inggeris, Bahasa Malaysia, Bahasa Cina, Bahasa Tamil, Bahasa Arab, Bahasa Perancis",
                humanities: "Kemanusiaan",
                "humanities.desc": "Sejarah, Geografi, Pengajian Islam, Pendidikan Moral, Ekonomi",
                technical: "Teknikal",
                "technical.desc": "ICT, Sains Komputer, Kejuruteraan, Lukisan Teknikal",
                exam: "Persediaan Peperiksaan",
                "exam.desc": "SPM, PT3, IGCSE, O-Level, Sesi Khas Peperiksaan Percubaan"
            },
            pricing: {
                title: "Pelan Tuisyen Berpatutan",
                description: "Pilih pakej pembelajaran yang sempurna untuk keperluan akademik dan bajet anda",
                permonth: "/bulan",
                popular: "Paling Popular",
                choose: "Pilih Pelan",
                plans: {
                    basic: {
                        name: "Asas",
                        feature1: "4 Kelas Berkumpulan Bulanan",
                        feature2: "1 Pilihan Subjek",
                        feature3: "Akses Dalam Talian Sahaja",
                        feature4: "Tiada Tutor Peribadi",
                        feature5: "Penilaian Terhad"
                    },
                    standard: {
                        name: "Standard",
                        feature1: "8 Kelas Berkumpulan Bulanan",
                        feature2: "3 Pilihan Subjek",
                        feature3: "Akses Dalam & Luar Talian",
                        feature4: "Laporan Kemajuan Mingguan",
                        feature5: "Sesi 1-on-1 Terhad"
                    },
                    premium: {
                        name: "Premium",
                        feature1: "Kelas Tanpa Had",
                        feature2: "Akses Semua Subjek",
                        feature3: "Tutor Peribadi Ditetapkan",
                        feature4: "Penjejakan Kemajuan Harian",
                        feature5: "Kursus Intensif Peperiksaan"
                    }
                }
            },
            enroll: {
                title: "Daftar Hari Ini & Mulakan Perjalanan Pembelajaran Anda",
                description: "Isi borang di bawah untuk mendaftar kelas percubaan percuma atau mendaftar dalam program tuisyen kami",
                form: {
                    studentName: "Nama Penuh Pelajar *",
                    parentName: "Nama Ibu Bapa/Penjaga *",
                    email: "Alamat Emel *",
                    phone: "Nombor Telefon *",
                    grade: "Gred/Tingkatan Semasa *",
                    selectGrade: "Pilih Gred",
                    form1: "Tingkatan 1",
                    form2: "Tingkatan 2",
                    form3: "Tingkatan 3",
                    form4: "Tingkatan 4",
                    form5: "Tingkatan 5",
                    subjects: "Subjek Diperlukan *",
                    math: "Matematik",
                    science: "Sains",
                    english: "Bahasa Inggeris",
                    malay: "Bahasa Malaysia",
                    history: "Sejarah",
                    geography: "Geografi",
                    physics: "Fizik",
                    chemistry: "Kimia",
                    biology: "Biologi",
                    addmath: "Matematik Tambahan",
                    selectMultiple: "Tahan Ctrl/Cmd untuk pilih pelbagai subjek",
                    learningMode: "Mod Pembelajaran Pilihan *",
                    selectMode: "Pilih Mod",
                    online: "Dalam Talian Sahaja",
                    offline: "Luar Talian Sahaja",
                    both: "Kedua-dua Dalam & Luar Talian",
                    plan: "Pelan Pilihan *",
                    selectPlan: "Pilih Pelan",
                    trial: "Kelas Percubaan Percuma Sahaja",
                    notes: "Nota atau Keperluan Tambahan",
                    consent: "Saya bersetuju menerima maklumat tentang kelas, jadual, dan bahan pendidikan melalui emel atau telefon.",
                    submit: "Hantar Borang Pendaftaran"
                },
                payment: {
                    title: "Pilihan Pembayaran Selamat",
                    description: "Selepas penghantaran, anda akan diarahkan ke gateway pembayaran selamat kami",
                    toyibpay: "Bayar dengan ToyyibPay"
                }
            },
            testimonials: {
                title: "Kisah Kejayaan daripada Pelajar Kami",
                description: "Dengari daripada pelajar dan ibu bapa yang telah mencapai kecemerlangan akademik dengan ExcelLearn",
                1: {
                    text: "\"Gred Matematik anak perempuan saya meningkat dari C ke A dalam masa 3 bulan sahaja. Perhatian peribadi dan penilaian berkala membuatkan perbezaan yang ketara!\"",
                    author: "Ibu Bapa Pelajar Tingkatan 3",
                    location: "Kuala Lumpur"
                },
                2: {
                    text: "\"Kelas dalam talian sangat interaktif dan menarik. Saya boleh belajar mengikut kadar sendiri dan tutor sentiasa tersedia untuk menjawab soalan saya.\"",
                    author: "Pelajar Sains Tingkatan 5",
                    location: "Pulau Pinang"
                },
                3: {
                    text: "\"Pendekatan komprehensif ExcelLearn untuk persediaan SPM membantu saya mencapai 8A. Strategi fokus peperiksaan dan ujian percubaan sangat berharga.\"",
                    author: "Graduan SPM 2023",
                    location: "Johor Bahru"
                }
            },
            contact: {
                title: "Hubungi ExcelLearn Pusat Tuisyen",
                description: "Ada soalan? Kami di sini untuk membantu anda dalam perjalanan pendidikan anda.",
                visit: "Lawati Pusat Kami",
                call: "Hubungi Kami",
                hours: "Isnin-Jumaat: 9pg-6pt, Sabtu: 9pg-1pt",
                email: "Emel Kami",
                form: {
                    title: "Hantar Mesej kepada Kami",
                    name: "Nama Anda",
                    email: "Emel Anda",
                    subject: "Subjek",
                    message: "Mesej Anda",
                    submit: "Hantar Mesej"
                }
            },
            footer: {
                about: {
                    title: "ExcelLearn Tuisyen",
                    description: "Menyediakan pendidikan sekolah menengah berkualiti melalui tuisyen dalam talian dan luar talian yang diperibadikan sejak 2015."
                },
                links: {
                    title: "Pautan Pantas"
                },
                legal: {
                    title: "Perundangan",
                    privacy: "Dasar Privasi",
                    terms: "Syarat Perkhidmatan",
                    refund: "Dasar Bayaran Balik",
                    faq: "Soalan Lazim"
                },
                newsletter: {
                    title: "Langgan Surat Berita",
                    placeholder: "Emel Anda",
                    subscribe: "Langgan"
                },
                rights: "Hak Cipta Terpelihara",
                accredited: "Institusi Diakreditasi MQA"
            }
        };
    }
}

// Initialize Language Manager
const languageManager = new LanguageManager();

// Export for use in other files
window.languageManager = languageManager;