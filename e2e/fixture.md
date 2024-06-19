```nomnoml
#stroke: #a86128
#direction: down
[<frame>Decorator pattern|
    [<abstract>Component||+ operation()]
    [Client] depends --> [Component]
    [Decorator|- next: Component]
    [Decorator] decorates -- [ConcreteComponent]
    [Component] <:- [Decorator]
    [Component] <:- [ConcreteComponent]
]
```
