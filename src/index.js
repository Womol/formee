export function serialize(form) {
	var i=0, j, key, tmp, out={};
	var rgx1 = /(radio|checkbox)/i;
	var rgx2 = /(file|reset|submit|button)/i;

	while (tmp = form.elements[i++]) {
		// Ignore unnamed, disabled, or (...rgx2) inputs
		if (!tmp.name || tmp.disabled || rgx2.test(tmp.type)) continue;

		key = tmp.name;

		// Grab all values from multi-select
		if (tmp.type === 'select-multiple') {
			out[key] = [];
			for (j=0; j < tmp.options.length; j++) {
				if (tmp.options[j].selected) {
					out[key].push(tmp.options[j].value);
				}
			}
		} else if (rgx1.test(tmp.type)) {
			if (tmp.checked) {
				j = out[key];
				tmp = tmp.value === 'on' || tmp.value;
				out[key] = (j == null && j !== 0) ? tmp : [].concat(j, tmp);
			}
		} else if (tmp.value || tmp.value === 0) {
			j = out[key];
			out[key] = (j == null && j !== 0) ? tmp.value : [].concat(j, tmp.value);
		}
	}

	return out;
}

export function validate(form, rules, toCheck) {
	rules = rules || {};
	var nxt, isOkay=true, out={};
	var k, msg, data=serialize(form);

	if (toCheck.trim) {
		nxt = {};
		nxt[toCheck] = rules[toCheck];
		rules = nxt;
	}

	for (k in rules) {
		// Accomodate Function or RegExp
		form.elements[k].isValid = void 0; // unset
		msg = (rules[k].test || rules[k]).call(rules[k], data[k], data);
		form.elements[k].isValid = (msg === true) || (out[k]=msg,isOkay=false);
	}

	form.isValid = isOkay;

	return out;
}

export function bind(form, opts) {
	opts = opts || {};

	form.serialize = serialize.bind(null, form);
	form.validate = validate.bind(null, form, opts.rules);

	form.onsubmit = function (ev) {
		ev.preventDefault();
		ev.errors = form.errors = form.validate();
		return form.isValid ? opts.onSubmit(ev) : opts.onError(ev);
	};

	return form;
}
