{% extends _dirname + '/server/database/' + database + '/mainTemplate.js' %}

{% block findOneAfter %}
    if (!request.actions?.login)
        delete result.data?.password

{% endblock %}
