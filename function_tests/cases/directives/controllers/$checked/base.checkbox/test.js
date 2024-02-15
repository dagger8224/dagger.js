runner('*checked directive base.checkbox test suite', describe, it, __dirname, async $ => {
    expect(await $('#checkbox1').prop('checked')).toBe(true);
    expect(await $('#checkbox2').prop('checked')).toBe(false);
    expect(await $('#checkbox3').prop('checked')).toBe(true);
    expect(await $('#checkbox4').prop('checked')).toBe(false);
    await $('#button1').click();
    expect(await $('#checkbox1').prop('checked')).toBe(false);
    await $('#button2').click();
    expect(await $('#checkbox2').prop('checked')).toBe(true);
});
