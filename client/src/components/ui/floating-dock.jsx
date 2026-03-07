import React, { useRef, useState } from "react";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";

export const FloatingDock = ({
    items,
    desktopClassName,
    mobileClassName,
    orientation = "horizontal",
}) => {
    return (
        <>
            <FloatingDockDesktop
                items={items}
                className={desktopClassName}
                orientation={orientation}
            />
            <FloatingDockMobile items={items} className={mobileClassName} />
        </>
    );
};

const FloatingDockMobile = ({ items, className }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={cn("relative block md:hidden", className)}>
            <AnimatePresence>
                {open && (
                    <motion.div
                        layoutId="nav"
                        className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2"
                    >
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: 10,
                                    transition: {
                                        delay: idx * 0.05,
                                    },
                                }}
                                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                            >
                                <Link
                                    to={item.href}
                                    key={item.title}
                                    className="h-10 w-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center"
                                >
                                    <div className="h-4 w-4">{item.icon}</div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <button
                onClick={() => setOpen(!open)}
                className="h-10 w-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center"
            >
                <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-400" />
            </button>
        </div>
    );
};

const FloatingDockDesktop = ({ items, className, orientation }) => {
    let mouseX = useMotionValue(Infinity);
    let mouseY = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => {
                mouseX.set(e.pageX);
                mouseY.set(e.pageY);
            }}
            onMouseLeave={() => {
                mouseX.set(Infinity);
                mouseY.set(Infinity);
            }}
            className={cn(
                "mx-auto hidden md:flex h-16 gap-4 items-end rounded-2xl px-4 pb-3",
                orientation === "vertical" && "flex-col h-auto w-16 items-center px-3 pb-4 pt-4",
                className
            )}
        >
            {items.map((item) => (
                <IconContainer
                    mouseX={mouseX}
                    mouseY={mouseY}
                    key={item.title}
                    orientation={orientation}
                    {...item}
                />
            ))}
        </motion.div>
    );
};

function IconContainer({ mouseX, mouseY, title, icon, href, orientation }) {
    let ref = useRef(null);

    let distance = useTransform(
        orientation === "horizontal" ? mouseX : mouseY,
        (val) => {
            let bounds = ref.current?.getBoundingClientRect() ?? {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            };

            if (orientation === "horizontal") {
                return val - bounds.x - bounds.width / 2;
            }
            return val - bounds.y - bounds.height / 2;
        }
    );

    let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

    let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
    let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

    let width = useSpring(widthTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    let height = useSpring(heightTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    let widthIcon = useSpring(widthTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    let heightIcon = useSpring(heightTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    const [hovered, setHovered] = useState(false);

    return (
        <Link to={href}>
            <motion.div
                ref={ref}
                style={{ width, height }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="aspect-square rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center relative"
            >
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 2, x: "-50%" }}
                            className={cn(
                                "px-2 py-0.5 whitespace-pre rounded-md border border-neutral-800 bg-neutral-900 text-neutral-100 absolute left-1/2 -top-10 w-fit text-xs",
                                orientation === "vertical" && "left-auto right-full mr-4 -top-0 bottom-0 my-auto h-fit"
                            )}
                        >
                            {title}
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    style={{ width: widthIcon, height: heightIcon }}
                    className="flex items-center justify-center"
                >
                    {icon}
                </motion.div>
            </motion.div>
        </Link>
    );
}
