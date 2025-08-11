 document.addEventListener('DOMContentLoaded', function () {

            // --- Mobile Menu Toggle ---
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const navLinks = document.getElementById('navLinks');
            const navLinksItems = document.querySelectorAll('.nav-links a');

            mobileMenuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
                mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
                mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
                mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
            });

            // Close mobile menu when a link is clicked
            navLinksItems.forEach(link => {
                link.addEventListener('click', () => {
                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                        mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                    }
                });
            });

            // --- Smooth Scrolling for Anchor Links ---
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = document.querySelector('header').offsetHeight;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });

            // --- Contact Form Logic ---
           const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                const formFields = [
                    { id: 'name', errorId: 'name-error', defaultError: 'هذا الحقل مطلوب' },
                    { id: 'email', errorId: 'email-error', defaultError: 'الرجاء إدخال بريد إلكتروني صحيح' },
                    { id: 'subject', errorId: 'subject-error', defaultError: 'الرجاء اختيار الموضوع' },
                    { id: 'message', errorId: 'message-error', defaultError: 'هذا الحقل مطلوب' }
                ];

                const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

                const showFieldError = (input, errorElement, message) => {
                    input.classList.add('error-input');
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                };

                const clearFieldError = (input, errorElement) => {
                    input.classList.remove('error-input');
                    errorElement.style.display = 'none';
                };

                const validateField = (field) => {
                    const input = document.getElementById(field.id);
                    const errorElement = document.getElementById(field.errorId);
                    let isValid = true;
                    
                    if (!input.value.trim()) {
                        showFieldError(input, errorElement, 'هذا الحقل مطلوب');
                        isValid = false;
                    } else if (input.type === 'email' && !validateEmail(input.value)) {
                        showFieldError(input, errorElement, field.defaultError);
                        isValid = false;
                    } else {
                        clearFieldError(input, errorElement);
                    }
                    return isValid;
                };

                formFields.forEach(field => {
                    const input = document.getElementById(field.id);
                    input.addEventListener('blur', () => validateField(field));
                    input.addEventListener('input', () => validateField(field));
                });

                contactForm.addEventListener('submit', async function (event) {
                    event.preventDefault();

                    let isFormValid = true;
                    formFields.forEach(field => {
                        if (!validateField(field)) {
                            isFormValid = false;
                        }
                    });

                    const recaptchaResponse = (typeof grecaptcha !== 'undefined') ? grecaptcha.getResponse() : null;
                    if (!recaptchaResponse) {
                        showStatusMessage('الرجاء إكمال التحقق من أنك لست روبوت', 'error');
                        isFormValid = false;
                    }

                    if (!isFormValid) {
                        const firstError = document.querySelector('.error-input');
                        if (firstError) {
                            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        return;
                    }

                    const submitBtn = this.querySelector('button[type="submit"]');
                    const originalBtnText = submitBtn.innerHTML;
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

                    try {
                        const response = await fetch(this.action, {
                            method: 'POST',
                            body: new FormData(this),
                            headers: { 'Accept': 'application/json' }
                        });

                        if (response.ok) {
                            showStatusMessage('تم إرسال رسالتك بنجاح! سأتواصل معك قريباً.', 'success');
                            this.reset();
                            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                            formFields.forEach(field => clearFieldError(document.getElementById(field.id), document.getElementById(field.errorId)));
                        } else {
                            throw new Error('فشل إرسال النموذج. حاول مرة أخرى.');
                        }
                    } catch (error) {
                        showStatusMessage(error.message || 'حدث خطأ. يرجى المحاولة مرة أخرى لاحقاً.', 'error');
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                });
            }

            function showStatusMessage(message, type = 'success') {
                const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
                const statusDiv = document.createElement('div');
                statusDiv.className = `status-message ${type}`;
                statusDiv.innerHTML = `<i class="fas ${iconClass}"></i><p>${message}</p>`;

                document.body.appendChild(statusDiv);

                setTimeout(() => {
                    statusDiv.classList.add('fade-out');
                    statusDiv.addEventListener('animationend', () => statusDiv.remove());
                }, 5000);
            }
        });
