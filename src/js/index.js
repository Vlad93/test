document.addEventListener("DOMContentLoaded", function() {

function populatedropdown(dayfield, monthfield, yearfield){
	let monthtext = ['Janiary','Febriary','March','April','May','June','July','August','September','October','November','December'];
	let today = new Date();
	dayfield = document.getElementById(dayfield);
	monthfield = document.getElementById(monthfield);
	yearfield = document.getElementById(yearfield);

	for (let i = 0; i < 12; i++)
		monthfield.options[i] = new Option(monthtext[i], monthtext[i]);
		monthfield.options[11].selected = true;		

	let startyear = 1900;
	for (let i = 0; i < today.getFullYear() - 1899; i++) {
		yearfield.options[i] = new Option(startyear, startyear);		
		startyear += 1;
	}
	yearfield.options[0] = new Option(1900, 1900);
	yearfield.options[95].selected = true;

	function getLastDayOfMonth(year) {		
		let indexSelectMonth = monthtext.findIndex(item => item === monthfield.value);			
		let date = new Date(year, indexSelectMonth + 1, 0);
		return date.getDate();
	}
	
	let lastDay = getLastDayOfMonth(yearfield.value);		
	for (let i = 0; i < lastDay; i++) {	
		if (i < 9) {
			dayfield.options[i] = new Option('0' + (i + 1),'0' + (i + 1));
		}	else {
			dayfield.options[i] = new Option(i + 1, i + 1);
		}				
	}	
	dayfield.options[20].selected = true;			
	return {
		monthtext,
		dayfield,
		monthfield,
		yearfield,
		getLastDayOfMonth,
	}
}

const dateDropdown = populatedropdown('date', 'month', 'year');

  // Select
  const nationalitySelect = document.getElementById('nationality');
  const choicesNationality = new Choices(nationalitySelect, {    
    silent: true,
		searchEnabled: false,
    itemSelectText: '',
    duplicateItemsAllowed: false,
  });

	let dayfieldChoices = new Choices(dateDropdown.dayfield, {    
    silent: true,
		searchEnabled: false,
    itemSelectText: '',
    duplicateItemsAllowed: false,
  });
	const monthfieldChoices = new Choices(dateDropdown.monthfield, {    
    silent: true,
		searchEnabled: false,
    itemSelectText: '',
    duplicateItemsAllowed: false,
  });
	const yearfieldChoices = new Choices(dateDropdown.yearfield, {    
    silent: true,
		searchEnabled: false,
    itemSelectText: '',
    duplicateItemsAllowed: false,
  });

	// Change dropdown on change month or year input 
	dateDropdown.monthfield.addEventListener('change', () => {	
		dayfieldChoices.destroy();			
		let lastDay = dateDropdown.getLastDayOfMonth(dateDropdown.yearfield.value);				
		dateDropdown.dayfield.innerHTML = '';		
		for (let i = 0; i < lastDay; i++) {			
			if (i < 9) {
				dateDropdown.dayfield.options[i] = new Option('0' + (i + 1),'0' + (i + 1));
			}	else {
				dateDropdown.dayfield.options[i] = new Option(i + 1, i + 1);
			}		
		}				
		dayfieldChoices = new Choices(dateDropdown.dayfield, {    
			silent: true,
			searchEnabled: false,
			itemSelectText: '',
			duplicateItemsAllowed: false,
		});
	});

	dateDropdown.yearfield.addEventListener('change', () => {	
		dayfieldChoices.destroy();			
		let lastDay = dateDropdown.getLastDayOfMonth(dateDropdown.yearfield.value);				
		dateDropdown.dayfield.innerHTML = '';		
		for (let i = 0; i < lastDay; i++) {			
			if (i < 9) {
				dateDropdown.dayfield.options[i] = new Option('0' + (i + 1),'0' + (i + 1));
			}	else {
				dateDropdown.dayfield.options[i] = new Option(i + 1, i + 1);
			}		
		}				
		dayfieldChoices = new Choices(dateDropdown.dayfield, {    
			silent: true,
			searchEnabled: false,
			itemSelectText: '',
			duplicateItemsAllowed: false,
		});
	});

  // Modals
	// Form validate and thanks modal, no-reload sending
	const preloader = document.querySelector('.preloader');	
	const signUpForm = document.querySelector('.signup-form');	
	const signUpSubmitBtn = document.querySelector('.signup-form__btn');	
	const modalWindowThanks = document.querySelector('.modal-window-thanks');

	const sendData = async (url, data) => {
		const response = await fetch (url, {
			method: 'POST',
			body: data,
		});
		if (!response.ok) {
			throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
		}
		return await response.json();
	}      	

	// Animation 
	let tlLoad = gsap.timeline();
	document.querySelectorAll('.signup-form__input-wrap').forEach((item) => {
		tlLoad.from(item, {
			opacity: 0,
			y: 40,
			duration: .6,
			ease: "power3.out"
		}, '-=.3');  		
	});  
	tlLoad.from('.signup-form__complete-wrap', {
		opacity: 0,
		y: 40,
		duration: .6,
		ease: "power3.out"
	}, ">");  
	tlLoad.eventCallback("onComplete", () => {
		document.querySelectorAll('.signup-form__input-wrap').forEach((item) => {
			item.style = "";
		});
		document.querySelector('.signup-form__complete-wrap').style = "";
	});

	

	const userIconVivus = new Vivus('user-icon',		{
			type: 'delayed',
			duration: 200,
			animTimingFunction: Vivus.EASE,			
		},	
	);	
	userIconVivus.play(function () {
		document.getElementById('user-icon').classList.add('filled');
	});
//

	
	const signUpFormValidate = new JustValidate(signUpForm, {
		errorFieldCssClass: 'is-invalid',
		successFieldCssClass: 'is-success',
		validateBeforeSubmitting: true,
		focusInvalidField: false,
		errorLabelCssClass: 'input-error',
		errorLabelStyle: {
			color: '#ff2828',
		},
	});

	signUpFormValidate
	.addField('#name', [
		{
			rule: 'required',
			errorMessage: 'The field is required',
		},
		{
			rule: 'minLength',
			value: 2,
			errorMessage: 'The field must contain a minimum of 2 characters'
		},
		{
			rule: 'maxLength',
			value: 30,
			errorMessage: 'The field must contain a maximum of 30 characters'
		},
		{
			rule: 'customRegexp',
			value: '[A-Za-zА-Яа-яёЁ]',
			errorMessage: 'The field can only contain letters and davis'
		},
	])
	.addField('#lastname', [
		{
			rule: 'required',
			errorMessage: 'The field is required',
		},
		{
			rule: 'minLength',
			value: 2,
			errorMessage: 'The field must contain a minimum of 2 characters'
		},
		{
			rule: 'maxLength',
			value: 30,
			errorMessage: 'The field must contain a maximum of 30 characters'
		},
		{
			rule: 'customRegexp',
			value: '[A-Za-zА-Яа-яёЁ]',
			errorMessage: 'The field can only contain letters and davis'
		},
	])
	.addField('#email', [
		{
			rule: 'required',
			errorMessage: 'The field is required',
		}, 
		{
			rule: 'email',			
			errorMessage: 'Email has invalid format'
		},         
	])
	.addRequiredGroup('.radios-wrap', 'Select at lease one option!')
	.addField('#password', [
		{
			rule: 'required',
			errorMessage: 'The field is required',
		},
		{
			rule: 'customRegexp',
			value: '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}',
			errorMessage: 'Password should contain minimum eight characters, at least one uppercase letter, one lowercase letter and one number'
		},
	])	
	.addField('#confirm-password', [
		{
			rule: 'required',
			errorMessage: 'The field is required',
		},
		{
			validator: (value, fields) => {
				if (fields[5]) {					
					const repeatPasswordValue = fields[5].elem.value;	
					return value === repeatPasswordValue;
				}	
				return true;
			},
			errorMessage: 'Passwords should be the same',
		},
	])
	.onFail((e) => {
		signUpSubmitBtn.classList.add('btn-error-submit');
		signUpSubmitBtn.addEventListener('animationend', () => {
			signUpSubmitBtn.classList.remove('btn-error-submit');			
			document.querySelector('.input-error').scrollIntoView({ block: 'center', behavior: 'smooth' });			
		})
	})
	.onSuccess((e) => {
		e.preventDefault();
		const dateInput = document.getElementById('bdate');
		let indexMonth = dateDropdown.monthtext.findIndex(item => dateDropdown.monthfield.value === item) + 1;
		indexMonth <= 9 ? indexMonth = '0' + indexMonth : indexMonth;
		dateInput.value = `${dateDropdown.yearfield.value}-${indexMonth}-${dateDropdown.dayfield.value}`;			
		const signUpFormData = new FormData(signUpForm);
		sendData ('https://jsonplaceholder.typicode.com/posts', signUpFormData)
		.then(() => {
			signUpForm.reset();
			preloader.classList.add('active');
			document.querySelector('.signup-form__login').style.zIndex = "9";
			setTimeout(() => {
				preloader.classList.remove('active');				
				modalWindowThanks.classList.add('show');
			}, 1500);
			setTimeout(() => {
				modalWindowThanks.classList.remove('show');		
				document.querySelector('.signup-form__login').style.zIndex = "4";
			}, 4000)
		})	
		.catch((err) => {
			alert(err);
		})		
	});
})
