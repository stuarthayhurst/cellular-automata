<script>
    /** @type {{ value: Number, setFn: function(Number):void, [name: string]:any}} */
    let { value, setFn, ...restProps } = $props();

    /** @type {HTMLInputElement} */
    let inputElement;
</script>

<input
    bind:this={inputElement}
    type="number"
    min="1"
    max="500"
    required
    {value}
    onchange={() => {
        if (inputElement.validity.valid) setFn(Number(inputElement.value));
    }}
    onfocusout={() => {
        if (!inputElement.validity.valid) inputElement.value = String(value);
    }}
    {...restProps}
/>
