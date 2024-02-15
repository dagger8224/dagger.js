runner('*value directive base test suite', describe, it, __dirname, async $ => {
    const selectors = ['button', 'checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'];
    const helper = (selectorValueMapping, defaultValue = '') => Promise.all(selectors.map(selector => $(`#${ selector }`).val().then(value => expect(`${ selector }: ${ value }`).toBe(`${ selector }: ${ Reflect.has(selectorValueMapping, selector) ? selectorValueMapping[selector] : defaultValue }`))));
    await helper({ // default value
        color: '#000000',
        range: '50'
    });
    await $('#button1').click(); // set value as 66
    await helper({
        color: '#000000',
        date: '1965-12-31',
        'datetime-local': '1965-12-31T16:00',
        file: '',
        month: '',
        time: '',
        week: ''
    }, '66');
    await $('#button2').click(); // set value as #aabb00
    await helper({
        date: '',
        'datetime-local': '',
        file: '',
        month: '',
        number: '',
        range: '50',
        time: '',
        week: ''
    }, '#aabb00');
    await $('#button3').click(); // set value as 2023-08-30
    await helper({
        color: '#000000',
        'datetime-local': '2023-08-30T00:00',
        file: '',
        month: '',
        number: '',
        range: '50',
        time: '',
        week: ''
    }, '2023-08-30');
    await $('#button4').click(); // set value as 2023-08
    await helper({
        color: '#000000',
        date: '',
        date: '2023-08-01',
        'datetime-local': '2023-08-01T00:00',
        file: '',
        number: '',
        range: '50',
        time: '',
        week: ''
    }, '2023-08');
    await $('#button5').click(); // set value as 2023-W08
    await helper({
        color: '#000000',
        date: '',
        'datetime-local': '',
        file: '',
        month: '',
        number: '',
        range: '50',
        time: ''
    }, '2023-W08');
    await $('#button6').click(); // set value as 20:44
    await helper({
        color: '#000000',
        date: '',
        'datetime-local': '',
        file: '',
        month: '',
        number: '',
        range: '50',
        week: ''
    }, '20:44');
    await $('#button7').click(); // set value as 135
    await $('#range').val().then(value => expect(value).toBe('100'));
});
