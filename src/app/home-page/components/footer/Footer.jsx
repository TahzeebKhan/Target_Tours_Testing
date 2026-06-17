"use client"
import React, { useEffect, useMemo, useState } from 'react'
import styles from './Footer.module.css'
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchFooterPublic } from '@/shared/services/footerPublic';

const fallbackFooter = {
    logo: "/images/footerIcon.png",
    description: "N/A",
    copyright: "N/A",
};

const fallbackSections = [
    {
        title: "N/A",
        links: [{ label: "N/A", url: "#" }],
    },
    {
        title: "N/A",
        links: [{ label: "N/A", url: "#" }],
    },
];

const fallbackLinkSections = [
    {
        title: "N/A",
        links: [{ label: "N/A", url: "#" }],
    },
    {
        title: "N/A",
        links: [{ label: "N/A", url: "#" }],
    },
    {
        title: "N/A",
        links: [{ label: "N/A", url: "#" }],
    },
    {
        title: "N/A",
        links: [{ label: "N/A", url: "#", icon: "/icons/address.svg" }],
    },
];

const toAbsoluteUrl = (value) => {
    const url = String(value || "").trim();
    if (!url) return "";
    if (/^(https?:)?\/\//i.test(url) || url.startsWith("/images/") || url.startsWith("/icons/")) return url;

    const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
    return backendUrl ? `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}` : url;
};

const normalizeLink = (link) => {
    if (typeof link === "string") return { label: link, url: "" };

    return {
        label: link?.label || link?.title || link?.text || link?.name || "",
        url: link?.url || link?.href || link?.link || (link?.id ? `/tour-details?id=${link.id}` : ""),
        icon: toAbsoluteUrl(link?.icon?.url || link?.icon),
    };
};

const getSectionLinks = (section) => {
    const links =
    section?.links ||
    section?.items ||
    section?.children ||
    section?.holiday_packages ||
    section?.packages ||
    section?.destinations ||
    section?.experiences ||
    [];

    return Array.isArray(links) ? links : [];
};

const normalizeSections = (sections) => {
    if (!Array.isArray(sections)) return [];

    return sections
        .map((section) => ({
            title: section?.title || section?.heading || section?.name || "",
            links: getSectionLinks(section)
                .map(normalizeLink)
                .filter((link) => link.label),
        }))
        .filter((section) => section.title && section.links.length);
};

const getFooterFromResponse = (response) => response?.footer || response?.data?.footer || response?.data || response || {};

const getFooterStorageKey = (domain) => `footer-public:${domain || "default"}`;

const readFooterCache = (domain) => {
    if (typeof window === "undefined") return null;

    try {
        const cachedValue = window.localStorage.getItem(getFooterStorageKey(domain));
        return cachedValue ? JSON.parse(cachedValue) : null;
    } catch (error) {
        console.warn("Failed to read footer cache", error);
        return null;
    }
};

const writeFooterCache = (domain, data) => {
    if (typeof window === "undefined" || !data) return;

    try {
        window.localStorage.setItem(
            getFooterStorageKey(domain),
            JSON.stringify({
                data,
                updatedAt: Date.now(),
            }),
        );
    } catch (error) {
        console.warn("Failed to write footer cache", error);
    }
};

const getStaticFooterIcon = (sectionIndex, linkIndex, label = "") => {
    if (sectionIndex !== 3) return "";

    const normalizedLabel = String(label || "").toLowerCase();
    if (normalizedLabel.includes("@")) return "/icons/email.svg";
    if (normalizedLabel.includes("hour") || normalizedLabel.includes("mon") || normalizedLabel.includes("sat")) return "/icons/clock.svg";
    if (normalizedLabel.includes("+") || normalizedLabel.includes("phone")) return "/icons/phone.svg";

    return ["/icons/address.svg", "/icons/phone.svg", "/icons/clock.svg", "/icons/email.svg"]?.[linkIndex] || "/icons/address.svg";
};

const splitLinks = (links) => [
    links.slice(0, 6),
    links.slice(6, 12),
    links.slice(12, 18),
    links.slice(18, 24),
];

const Footer = () => {
    const [openState, setOpenState] = useState({
  first: false,
  second: false,
});
    const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:1337";
    const cachedFooter = useMemo(() => readFooterCache(domain), [domain]);

    const { data, isError } = useQuery({
        queryKey: ["footer-public", domain],
        queryFn: fetchFooterPublic,
        initialData: cachedFooter?.data,
        initialDataUpdatedAt: cachedFooter?.updatedAt,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (data) {
            writeFooterCache(domain, data);
        }
    }, [data, domain]);

    if (isError) {
        console.warn("Failed to load footer CMS");
    }

    const footerData = useMemo(() => {
        const footer = getFooterFromResponse(data);
        const allLinkSections = normalizeSections(footer?.link_sections );
        const contentSections = [
            ...normalizeSections(
                footer?.package_sections  )
        
        ];
        const contentFromLinks = allLinkSections.filter((section) => {
            const title = section.title.toLowerCase();
            return title.includes("popular") || title.includes("themed") || title.includes("holiday");
        });
        const footerLinkSections = allLinkSections.filter((section) => !contentFromLinks.includes(section));
        const sections = contentSections.length || contentFromLinks.length ? [...contentSections, ...contentFromLinks] : fallbackSections;
        const linkSections = footerLinkSections.length ? footerLinkSections : fallbackLinkSections;

        return {
            logo: toAbsoluteUrl(footer?.logo?.url || footer?.footer_logo?.url || footer?.logo || footer?.footer_logo) || fallbackFooter.logo,
            description: footer?.description || footer?.footer_description || fallbackFooter.description,
            copyright: footer?.copyright_text || footer?.copyright || footer?.copyrightText || fallbackFooter.copyright,
            sections,
            linkSections,
        };
    }, [data]);

    const firstSection = footerData?.sections?.[0] || fallbackSections?.[0] || { title: "", links: [] };
    const secondSection = footerData?.sections?.[1] || fallbackSections?.[1] || { title: "", links: [] };
    const firstSectionLinks = Array.isArray(firstSection?.links) ? firstSection.links : [];
    const secondSectionLinks = Array.isArray(secondSection?.links) ? secondSection.links : [];
    const firstColumns = splitLinks(firstSectionLinks);
    const secondColumns = splitLinks(secondSectionLinks);
    const footerLinkSections = fallbackLinkSections.map(
        (fallbackSection, index) => footerData?.linkSections?.[index] || fallbackSection,
    );

    return (
        <section className={styles.footer}>





            <div className={styles.container}>
                <div className={styles.footerTop}>

                    <img src={footerData?.logo || fallbackFooter.logo} alt="" />
                    <p>{footerData?.description || 'N/A'}</p>
                </div>

                <div className={styles.footerBoder}></div>


                <div className={styles.accordionWrapper}>
                    <div className={styles.accordionItem}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() =>
                                setOpenState((prev) => ({
                                    ...prev,
                                    first: !prev.first,
                                }))
                            }
                        >
                            <span className={styles.blockHead} >{firstSection?.title || ""}</span>
                            <span className={`${styles.arrow} ${openState.first ? styles.rotate : ''}`}>
                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_1042_7175)">
                                        <path d="M2 2.5L7 7.5L12 2.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1042_7175">
                                            <rect width="12" height="7" fill="white" transform="translate(1 1.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>

                            </span>
                        </button>

                        <div className={styles.accordionContainer}>
                            <div className={`${styles.accordionBody} ${openState.first ? styles.show : ''}`}>
                                {firstSectionLinks.map((link, index) => (
                                    <React.Fragment key={`${link?.label || "footer-link"}-${index}`}>
                                        <Link href={link?.url || "#"} className={styles.linkText}>
                                            {link?.label || ""}
                                        </Link>
                                        {index < firstSectionLinks.length - 1 ? <span className={styles.dot}>.</span> : null}
                                    </React.Fragment>
                                ))}

                            </div>
                        </div>
                    </div>
                    <div className={styles.accordionItem}>
                        <button
                            className={styles.accordionHeader}
                            onClick={() =>
                                setOpenState((prev) => ({
                                    ...prev,
                                    second: !prev.second,
                                }))
                            }
                        >
                            <span className={styles.blockHead}>
                                {secondSection?.title || ""}
                            </span>

                            <span className={`${styles.arrow} ${openState.second ? styles.rotate : ""}`}>
                                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                                    <path
                                        d="M2 2.5L7 7.5L12 2.5"
                                        stroke="#FFFFFF"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </button>

                        <div className={styles.accordionContainer}>
                            <div className={`${styles.accordionBody} ${openState.second ? styles.show : ""}`}>

                                {secondSectionLinks.map((link, index) => (
                                    <React.Fragment key={`${link?.label || "footer-link"}-${index}`}>
                                        <Link href={link?.url || "#"} className={styles.linkText}>
                                            {link?.label || ""}
                                        </Link>
                                        {index < secondSectionLinks.length - 1 ? <span className={styles.dot}>.</span> : null}
                                    </React.Fragment>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.mediaIcons}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    <span className={styles.dot}>.</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                     <span className={styles.dot}>.</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                     <span className={styles.dot}>.</span>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </div>



                <div className={styles.footerBlockWrapper}>
                    <div className={styles.footerBlock}>
                        <div className={styles.blockHead}>
                            {firstSection?.title || ""}
                        </div>

                        <div className={styles.blockItems}>
                            {firstColumns.map((column, columnIndex) => (
                                <ul key={`${firstSection?.title || "footer-section"}-${columnIndex}`}>
                                    {(column || []).map((link, linkIndex) => (
                                        <li key={`${link?.label || "footer-link"}-${linkIndex}`}><Link href={link?.url || "#"}><span className={styles.linkText}>{link?.label || ""}</span></Link></li>
                                    ))}
                                </ul>
                            ))}
                        </div>
                    </div>


                    <div className={styles.footerBoder}></div>

                    <div className={styles.footerBlock}>
                        <div className={styles.blockHead}>
                            {secondSection?.title || ""}
                        </div>

                        <div className={styles.blockItems}>
                            {secondColumns.map((column, columnIndex) => (
                                <ul key={`${secondSection?.title || "footer-section"}-${columnIndex}`}>
                                    {(column || []).map((link, linkIndex) => (
                                        <li key={`${link?.label || "footer-link"}-${linkIndex}`}><Link href={link?.url || "#"}><span className={styles.linkText}>{link?.label || ""}</span></Link></li>
                                    ))}
                                </ul>
                            ))}
                        </div>
                    </div>
                    <div className={styles.footerBoder}></div>
                    <div className={styles.footerLinkBlock}>
                        {footerLinkSections.map((section, sectionIndex) => (
                            <div className={styles.footerLinkCont} key={`${section?.title || "footer-section"}-${sectionIndex}`}>
                                <h3 className={styles.linkHead}>{section?.title || ""}</h3>
                                <ul>
                                    {(section?.links || []).map((link, linkIndex) => (
                                        <li key={`${link?.label || "N/A"}-${linkIndex}`}>
                                            <a href={link?.url || "#"}>
                                                <span className={styles.linkText}>
                                                    {sectionIndex === 3 ? <img src={link?.icon || getStaticFooterIcon(sectionIndex, linkIndex, link?.label)} alt="" /> : null}{link?.label || "N/A"}
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className={styles.footerBoder}></div>
                </div>
                <div className={styles.copywrite}>
                    {footerData?.copyright || fallbackFooter.copyright}
                </div>
            </div>
        </section>
    )
}

export default Footer
