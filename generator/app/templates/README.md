[<%= props.name %>][<%= props.domain %>]
<%= new Array(props.name.length + props.domain.length + 5).join('=') %>

> Powered by [Genesis WordPress][genesis-wordpress]

<%= readmeFile %>
[<%= props.domain %>]: http://www.<%= props.domain %>/
[genesis-wordpress]: https://github.com/genesis/wordpress/
