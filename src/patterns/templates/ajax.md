# Multiple layouts support
  Neutron supports multiple layouts. You just need to add a layout property in your json file related to the partial and it will render in your template file.

# contentFor helper
When you want to print something from your pattern in your layout, you can do it using the `contentFor` helper. After that, just add the helper `outputFor` in your layout.

## Example:

*Pattern file:*

> &lbrace;&lbrace;contentFor "ruleName"&rbrace;&rbrace;
>   ... content or markup goes here
> &lbrace;&lbrace;/contentFor&rbrace;&rbrace;

*Layout file:*

> &lbrace;&lbrace;outputFor "ruleName"&rbrace;&rbrace;
